const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { loginValidator, otpValidator, signupValidator, passwordRule } = require('../validators/authValidators');

const router = express.Router();

router.post('/user/signup', signupValidator, validateRequest, authController.signupUser);
router.post('/user/login', loginValidator, validateRequest, authController.loginUser);
router.post('/admin/login', loginValidator, validateRequest, authController.loginAdmin);
router.post('/verify-otp', otpValidator, validateRequest, authController.verifyOtp);
router.post(
  '/resend-otp',
  [body('email').isEmail().withMessage('Valid email is required')],
  validateRequest,
  authController.resendOtp,
);
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  validateRequest,
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    passwordRule('newPassword').withMessage('Password must be strong'),
  ],
  validateRequest,
  authController.resetPassword,
);
router.get('/me', protect, authController.getCurrentAccount);
router.patch('/profile', protect, authController.updateProfile);

module.exports = router;
