const Therapist = require('../models/Therapist');

const serializePublicTherapist = (therapist) => {
  const profile = therapist.toObject();
  profile.profilePhotoUrl = therapist.profilePhotoUpdatedAt
    ? `/api/therapist/photo/${therapist._id}?v=${therapist.profilePhotoUpdatedAt.getTime()}`
    : null;
  return profile;
};

exports.getPublicTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find({}).select('name slug bio profilePhotoUpdatedAt').sort({ name: 1 });
    res.status(200).json(therapists.map(serializePublicTherapist));
  } catch (error) {
    res.status(500).json({ message: 'Could not load therapists', error: error.message });
  }
};

exports.getTherapistBySlug = async (req, res) => {
  try {
    const therapist = await Therapist.findOne({ slug: req.params.slug }).select('-password -profilePhotoData -profilePhotoContentType');

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    res.status(200).json(serializePublicTherapist(therapist));
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

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Choose a JPEG, PNG, or WebP image.' });

    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) return res.status(404).json({ message: 'Therapist not found.' });

    therapist.profilePhotoData = req.file.buffer;
    therapist.profilePhotoContentType = req.file.mimetype;
    therapist.profilePhotoUpdatedAt = new Date();
    await therapist.save();

    return res.status(200).json({
      profilePhotoUrl: `/api/therapist/photo/${therapist._id}?v=${therapist.profilePhotoUpdatedAt.getTime()}`,
      profilePhotoUpdatedAt: therapist.profilePhotoUpdatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not save the profile photo.', error: error.message });
  }
};

exports.getProfilePhoto = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id)
      .select('+profilePhotoData +profilePhotoContentType +profilePhotoUpdatedAt');
    if (!therapist?.profilePhotoData || !therapist.profilePhotoContentType) {
      return res.status(404).json({ message: 'Profile photo not found.' });
    }

    res.set('Content-Type', therapist.profilePhotoContentType);
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(therapist.profilePhotoData);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load the profile photo.', error: error.message });
  }
};