const { body } = require('express-validator');

const messageValidator = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('receiverId').optional().isMongoId().withMessage('Invalid receiver'),
];

module.exports = {
  messageValidator,
};
