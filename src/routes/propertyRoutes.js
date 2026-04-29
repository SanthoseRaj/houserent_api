const express = require('express');
const propertyController = require('../controllers/propertyController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { propertyCreateValidator, propertyUpdateValidator } = require('../validators/propertyValidators');

const router = express.Router();

router.get('/', propertyController.listProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', protect, authorize('admin'), propertyCreateValidator, validateRequest, propertyController.createProperty);
router.patch('/:id', protect, authorize('admin'), propertyUpdateValidator, validateRequest, propertyController.updateProperty);
router.delete('/:id', protect, authorize('admin'), propertyController.deleteProperty);

module.exports = router;
