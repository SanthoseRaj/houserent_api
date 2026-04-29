const { body } = require('express-validator');
const { PROPERTY_STATUS, PROPERTY_TYPES } = require('../constants/appConstants');

const propertyCreateValidator = [
  body('title').trim().notEmpty().withMessage('Property title is required'),
  body('type').isIn(Object.values(PROPERTY_TYPES)).withMessage('Invalid property type'),
  body('address.line1').trim().notEmpty().withMessage('Address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('rent').isFloat({ min: 1 }).withMessage('Rent amount must be greater than zero'),
  body('deposit').isFloat({ min: 0 }).withMessage('Deposit cannot be negative'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('status').optional().isIn(Object.values(PROPERTY_STATUS)).withMessage('Invalid property status'),
];

const propertyUpdateValidator = [
  body('title').optional().trim().notEmpty().withMessage('Property title is required'),
  body('type').optional().isIn(Object.values(PROPERTY_TYPES)).withMessage('Invalid property type'),
  body('address.line1').optional().trim().notEmpty().withMessage('Address is required'),
  body('address.city').optional().trim().notEmpty().withMessage('City is required'),
  body('rent').optional().isFloat({ min: 1 }).withMessage('Rent amount must be greater than zero'),
  body('deposit').optional().isFloat({ min: 0 }).withMessage('Deposit cannot be negative'),
  body('description').optional().trim().notEmpty().withMessage('Description is required'),
  body('status').optional().isIn(Object.values(PROPERTY_STATUS)).withMessage('Invalid property status'),
];

module.exports = {
  propertyCreateValidator,
  propertyUpdateValidator,
};
