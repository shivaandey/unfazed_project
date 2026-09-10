const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Therapist = require('../models/Therapist');
const generateSlug = require('../utils/generateSlug');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, bio, specializations, languages } = req.body;

    let therapist = await Therapist.findOne({ email });
    if (therapist) return res.status(400).json({ message: 'Therapist already exists' });

    const slug = await generateSlug(name);
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    therapist = new Therapist({ name, email, password_hash, slug, bio, specializations, languages });
    await therapist.save();

    const token = jwt.sign({ id: therapist._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, therapist: { id: therapist._id, name, slug, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    
    const therapist = await Therapist.findOne({ email });
    if (!therapist) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, therapist.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign({ id: therapist._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, therapist: { id: therapist._id, name: therapist.name, slug: therapist.slug } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};