const Therapist = require('../models/Therapist');

exports.getTherapistBySlug = async (req, res) => {
  try {
    const therapist = await Therapist.findOne({ slug: req.params.slug }).select('-password');

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    res.status(200).json(therapist);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, specializations, languages } = req.body;

    const updatedTherapist = await Therapist.findByIdAndUpdate(
      req.user.id,
      { name, bio, specializations, languages },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedTherapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    res.status(200).json(updatedTherapist);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};