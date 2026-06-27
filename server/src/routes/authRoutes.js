const express = require('express');
const router = express.Router();
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

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validate, resetPassword);

router.get('/me', protect, getMe);
router.put('/update-details', protect, updateProfileValidator, validate, updateDetails);
router.put('/update-password', protect, updatePasswordValidator, validate, updatePassword);
router.put('/avatar', protect, handleUpload, updateAvatar);
router.put('/push-token', protect, updatePushToken);

module.exports = router;
