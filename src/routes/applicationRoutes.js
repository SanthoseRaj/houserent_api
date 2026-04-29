const express = require('express');
const { body } = require('express-validator');
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { applicationValidator } = require('../validators/applicationValidators');

const router = express.Router();

router.post('/', protect, authorize('user'), applicationValidator, validateRequest, applicationController.createApplication);
router.get('/mine', protect, authorize('user'), applicationController.getMyApplications);
router.get('/', protect, authorize('admin'), applicationController.getApplications);
router.get('/:id', protect, applicationController.getApplicationById);
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  [body('status').isIn(['submitted', 'under_review', 'approved', 'rejected']).withMessage('Invalid status')],
  validateRequest,
  applicationController.updateApplicationStatus,
);

module.exports = router;
