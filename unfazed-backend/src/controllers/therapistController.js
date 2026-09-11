const Therapist = require('../models/Therapist');

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, specializations, languages } = req.body;
    
    const updatedTherapist = await Therapist.findByIdAndUpdate(
      req.therapist.id,
      { name, bio, specializations, languages },
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!updatedTherapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    res.status(200).json(updatedTherapist);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};