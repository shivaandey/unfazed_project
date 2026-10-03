const Therapist = require('../models/Therapist');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const generateSlug = require('../utils/generateSlug');
const { sendTherapistPasswordResetCode } = require('../services/notificationService');

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const passwordResetMessage = 'If an account exists for that email, a reset code will be sent.';
const hashResetCode = (therapistId, code) => crypto
  .createHmac('sha256', process.env.JWT_SECRET)
  .update(`${therapistId}:${code}`)
  .digest('hex');

const getStoredPasswordHash = (therapist) => {
  if (!therapist) return null;
  return therapist.password || therapist.password_hash || null;
};

const generateToken = (id) => {
  return jwt.sign({ id, role: 'therapist' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const therapistExists = await Therapist.findOne({ email: email.toLowerCase() });
    if (therapistExists) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const slug = await generateSlug(name);

    const therapist = await Therapist.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'therapist',
      slug
    });

    if (therapist) {
      res.status(201).json({
        _id: therapist.id,
        name: therapist.name,
        email: therapist.email,
        role: therapist.role,
        tier: therapist.tier,
        subscriptionTier: therapist.subscriptionTier,
        slug: therapist.slug,
        token: generateToken(therapist._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Registration error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const therapist = await Therapist.findOne({ email: normalizedEmail });

    if (!therapist) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const storedHash = getStoredPasswordHash(therapist);
    if (!storedHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, storedHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!therapist.password && therapist.password_hash) {
      therapist.password = therapist.password_hash;
      delete therapist.password_hash;
      await therapist.save();
    }

    res.json({
      _id: therapist.id,
      name: therapist.name,
      email: therapist.email,
      role: therapist.role,
      tier: therapist.tier,
      subscriptionTier: therapist.subscriptionTier,
      slug: therapist.slug,
      token: generateToken(therapist._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.user.id).select('-password');

    if (!therapist) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json(therapist);
  } catch (error) {
    res.status(500).json({ message: 'Profile fetch error', error: error.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(503).json({ message: 'Email verification is not configured. Contact support.' });
    }

    const therapist = await Therapist.findOne({ email }).select('+passwordResetCodeSentAt');
    if (!therapist) return res.status(202).json({ message: passwordResetMessage });

    if (therapist.passwordResetCodeSentAt && Date.now() - therapist.passwordResetCodeSentAt.getTime() < 60_000) {
      return res.status(429).json({ message: 'Please wait a minute before requesting another code.' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    therapist.passwordResetCodeHash = hashResetCode(therapist._id, code);
    therapist.passwordResetCodeExpiresAt = new Date(Date.now() + 10 * 60_000);
    therapist.passwordResetCodeSentAt = new Date();
    therapist.passwordResetCodeAttempts = 0;
    await therapist.save();

    const sent = await sendTherapistPasswordResetCode({ to: therapist.email, code });
    if (!sent) {
      therapist.passwordResetCodeHash = undefined;
      therapist.passwordResetCodeExpiresAt = undefined;
      therapist.passwordResetCodeSentAt = undefined;
      therapist.passwordResetCodeAttempts = 0;
      await therapist.save();
      return res.status(503).json({ message: 'Could not send the reset code. Check email settings and try again.' });
    }

    return res.status(202).json({ message: passwordResetMessage });
  } catch (error) {
    console.error('Password reset code request failed:', error.message);
    return res.status(500).json({ message: 'Could not request a password reset code.' });
  }
};

exports.confirmPasswordReset = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || '').trim();
    const { newPassword } = req.body;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code) || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'Enter a valid email, six-digit code, and password of at least 8 characters.' });
    }

    const therapist = await Therapist.findOne({ email }).select('+passwordResetCodeHash +passwordResetCodeExpiresAt +passwordResetCodeAttempts');
    if (!therapist || !therapist.passwordResetCodeHash || !therapist.passwordResetCodeExpiresAt || therapist.passwordResetCodeExpiresAt <= new Date()) {
      return res.status(401).json({ message: 'The reset code is invalid or expired. Request a new one.' });
    }
    if (therapist.passwordResetCodeAttempts >= 5) {
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.' });
    }

    const expectedHash = Buffer.from(therapist.passwordResetCodeHash, 'hex');
    const suppliedHash = Buffer.from(hashResetCode(therapist._id, code), 'hex');
    if (expectedHash.length !== suppliedHash.length || !crypto.timingSafeEqual(expectedHash, suppliedHash)) {
      therapist.passwordResetCodeAttempts += 1;
      await therapist.save();
      return res.status(401).json({ message: 'The reset code is invalid or expired.' });
    }

    therapist.password = await bcrypt.hash(newPassword, 10);
    therapist.passwordResetCodeHash = undefined;
    therapist.passwordResetCodeExpiresAt = undefined;
    therapist.passwordResetCodeSentAt = undefined;
    therapist.passwordResetCodeAttempts = 0;
    await therapist.save();

    return res.status(200).json({ message: 'Password reset successfully. Sign in with your new password.' });
  } catch (error) {
    console.error('Password reset confirmation failed:', error.message);
    return res.status(500).json({ message: 'Could not reset the password.' });
  }
};