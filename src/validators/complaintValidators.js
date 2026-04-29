const { body } = require('express-validator');

const complaintValidator = [
  body('propertyId').isMongoId().withMessage('Property is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

module.exports = {
  complaintValidator,
};
