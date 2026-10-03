const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { getPublicTherapists, getTherapistBySlug, updateProfile, uploadProfilePhoto, getProfilePhoto } = require('../controllers/therapistController');

const photoUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 2 * 1024 * 1024, files: 1 },
	fileFilter: (req, file, callback) => {
		const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!acceptedTypes.includes(file.mimetype)) {
			const error = new Error('Only JPEG, PNG, and WebP photos are allowed.');
			error.status = 400;
			return callback(error);
		}
		return callback(null, true);
	},
});

router.get('/public', getPublicTherapists);
router.get('/photo/:id', getProfilePhoto);
router.get('/slug/:slug', getTherapistBySlug);
router.put('/profile', protect, updateProfile);
router.put('/profile/photo', protect, (req, res, next) => {
	photoUpload.single('photo')(req, res, (error) => {
		if (!error) return next();
		const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : error.status || 400;
		return res.status(status).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Photo must be 2 MB or smaller.' : error.message });
	});
}, uploadProfilePhoto);

module.exports = router;