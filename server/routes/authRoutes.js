const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  verifyEmailToken,
  verifyEmailOtp,
  verifyResetOtp,
  verifyOtp,
  resendVerificationLink,
  forgotPassword,
  resendOtp,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
  getAllUsers,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify-email-token', verifyEmailToken);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-verification-link', resendVerificationLink);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, adminOnly, getAllUsers);

module.exports = router;
