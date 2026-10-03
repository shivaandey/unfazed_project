const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const Therapist = require('../models/Therapist');
const { sendClientAccessCode } = require('../services/notificationService');

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const normalizeName = (name = '') => String(name).trim().replace(/\s+/g, ' ').toLowerCase();
const genericRequestMessage = 'If the details match an active client record, a verification code will be sent to that email.';
const hashCode = (clientId, code) => crypto
  .createHmac('sha256', process.env.JWT_SECRET)
  .update(`${clientId}:${code}`)
  .digest('hex');

exports.requestClientCode = async (req, res) => {
  try {
    const { therapistSlug, email, name, mode } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!therapistSlug || !normalizedEmail || !['register', 'login'].includes(mode)) {
      return res.status(400).json({ message: 'Therapist, email, and access mode are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || (mode === 'register' && !normalizeName(name))) {
      return res.status(400).json({ message: mode === 'register' ? 'Enter your name and a valid email.' : 'Enter a valid email.' });
    }

    const therapist = await Therapist.findOne({ slug: therapistSlug }).select('_id name');
    if (!therapist) return res.status(202).json({ message: genericRequestMessage });

    const client = await Client.findOne({
      therapistId: therapist._id,
      email: normalizedEmail,
      status: 'Active',
    }).select('+loginCodeSentAt +loginCodeAttempts');

    const validRosterClient = client
      && (mode !== 'register' || (!client.clientAccessEnabled && normalizeName(client.name) === normalizeName(name)))
      && (mode !== 'login' || client.clientAccessEnabled);
    if (!validRosterClient) return res.status(202).json({ message: genericRequestMessage });

    if (client.loginCodeSentAt && Date.now() - client.loginCodeSentAt.getTime() < 60_000) {
      return res.status(429).json({ message: 'Please wait a minute before requesting another code.' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    client.loginCodeHash = hashCode(client._id, code);
    client.loginCodeExpiresAt = new Date(Date.now() + 10 * 60_000);
    client.loginCodeSentAt = new Date();
    client.loginCodeAttempts = 0;
    client.loginCodePurpose = mode;
    await client.save();

    const sent = await sendClientAccessCode({ to: normalizedEmail, code, therapistName: therapist.name });
    if (!sent) {
      client.loginCodeHash = undefined;
      client.loginCodeExpiresAt = undefined;
      client.loginCodeSentAt = undefined;
      client.loginCodeAttempts = 0;
      client.loginCodePurpose = undefined;
      await client.save();
      return res.status(503).json({ message: 'Email verification is temporarily unavailable. Please contact the therapist.' });
    }

    return res.status(202).json({ message: genericRequestMessage });
  } catch (error) {
    console.error('Client access code request failed:', error.message);
    return res.status(500).json({ message: 'Could not request a verification code.' });
  }
};

exports.verifyClientCode = async (req, res) => {
  try {
    const { therapistSlug, email, name, mode, code } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedCode = String(code || '').trim();

    if (!therapistSlug || !normalizedEmail || !['register', 'login'].includes(mode) || !/^\d{6}$/.test(normalizedCode)) {
      return res.status(400).json({ message: 'Enter the six-digit verification code.' });
    }

    const therapist = await Therapist.findOne({ slug: therapistSlug }).select('_id name');
    if (!therapist) return res.status(401).json({ message: 'The code is invalid or expired.' });

    const client = await Client.findOne({
      therapistId: therapist._id,
      email: normalizedEmail,
      status: 'Active',
    }).select('+loginCodeHash +loginCodeExpiresAt +loginCodeAttempts +loginCodePurpose');

    const validMode = client && client.loginCodePurpose === mode
      && (mode === 'register'
        ? !client.clientAccessEnabled && normalizeName(client.name) === normalizeName(name)
        : client.clientAccessEnabled);
    if (!validMode || !client.loginCodeHash || !client.loginCodeExpiresAt || client.loginCodeExpiresAt <= new Date()) {
      return res.status(401).json({ message: 'The code is invalid or expired. Request a new one.' });
    }

    if (client.loginCodeAttempts >= 5) {
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.' });
    }

    const suppliedHash = Buffer.from(hashCode(client._id, normalizedCode), 'hex');
    const expectedHash = Buffer.from(client.loginCodeHash, 'hex');
    if (suppliedHash.length !== expectedHash.length || !crypto.timingSafeEqual(suppliedHash, expectedHash)) {
      client.loginCodeAttempts += 1;
      await client.save();
      return res.status(401).json({ message: 'The code is invalid or expired.' });
    }

    client.clientAccessEnabled = true;
    client.loginCodeHash = undefined;
    client.loginCodeExpiresAt = undefined;
    client.loginCodeSentAt = undefined;
    client.loginCodeAttempts = 0;
    client.loginCodePurpose = undefined;
    await client.save();

    const token = jwt.sign({
      id: client._id,
      role: 'client',
      therapistId: therapist._id,
    }, process.env.JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      token,
      client: { id: client._id, name: client.name, email: client.email },
      therapist: { id: therapist._id, name: therapist.name, slug: therapist.slug },
    });
  } catch (error) {
    console.error('Client access code verification failed:', error.message);
    return res.status(500).json({ message: 'Could not verify the client access code.' });
  }
};
