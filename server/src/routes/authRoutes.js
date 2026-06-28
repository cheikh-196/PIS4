const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register, login, getMe, updateDetails, updatePassword,
  updateAvatar, updatePushToken, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const handleUpload = require('../middleware/upload');
const {
  registerValidator, loginValidator, forgotPasswordValidator,
  resetPasswordValidator, updateProfileValidator, updatePasswordValidator,
} = require('../validators/authValidator');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

router.post('/register', registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validate, resetPassword);

router.get('/me', protect, getMe);
router.put('/update-details', protect, updateProfileValidator, validate, updateDetails);
router.put('/update-password', protect, updatePasswordValidator, validate, updatePassword);
router.put('/avatar', protect, handleUpload, updateAvatar);
router.put('/push-token', protect, updatePushToken);

module.exports = router;
