const { body } = require('express-validator');
const { isValidAadhaar } = require('../utils/validators');

const normalizePhone = (value = '') => value.toString().replace(/\D/g, '');

const phoneRule = (field = 'phone') =>
  body(field)
    .customSanitizer(normalizePhone)
    .matches(/^\d{10,15}$/)
    .withMessage('Valid phone is required');

const passwordRule = (field = 'password') =>
  body(field)
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/)
    .withMessage('Password must include upper, lower, number and special character');

const signupValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  phoneRule(),
  passwordRule(),
  body('aadhaarNumber')
    .optional({ values: 'falsy' })
    .custom((value) => isValidAadhaar(value))
    .withMessage('Invalid Aadhaar number'),
];

const loginValidator = [
  phoneRule(),
  body('password').notEmpty().withMessage('Password is required'),
];

const otpValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

module.exports = {
  phoneRule,
  passwordRule,
  signupValidator,
  loginValidator,
  otpValidator,
};
