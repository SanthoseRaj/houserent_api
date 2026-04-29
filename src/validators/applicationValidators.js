const { body } = require('express-validator');
const { isValidAadhaar } = require('../utils/validators');

const applicationValidator = [
  body('propertyId').isMongoId().withMessage('Property is required'),
  body('personalDetails.fullName').trim().notEmpty().withMessage('Applicant name is required'),
  body('personalDetails.mobileNumber').trim().notEmpty().withMessage('Mobile number is required'),
  body('personalDetails.email').isEmail().withMessage('Valid email is required'),
  body('personalDetails.currentAddress').trim().notEmpty().withMessage('Current address is required'),
  body('personalDetails.permanentAddress').trim().notEmpty().withMessage('Permanent address is required'),
  body('personalDetails.aadhaarNumber')
    .custom((value) => isValidAadhaar(value))
    .withMessage('Invalid Aadhaar number'),
];

module.exports = {
  applicationValidator,
};
