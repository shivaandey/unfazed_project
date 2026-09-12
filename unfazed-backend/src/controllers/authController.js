const Therapist = require('../models/Therapist');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const therapistExists = await Therapist.findOne({ email });
    if (therapistExists) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const therapist = await Therapist.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    if (therapist) {
      res.status(201).json({
        _id: therapist.id,
        name: therapist.name,
        email: therapist.email,
        role: therapist.role,
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
    const therapist = await Therapist.findOne({ email });

    if (therapist && (await bcrypt.compare(password, therapist.password))) {
      res.json({
        _id: therapist.id,
        name: therapist.name,
        email: therapist.email,
        role: therapist.role,
        token: generateToken(therapist._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
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

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const therapist = await Therapist.findOne({ email });

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    const salt = await bcrypt.genSalt(10);
    therapist.password = await bcrypt.hash(newPassword, salt);
    await therapist.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset error', error: error.message });
  }
};