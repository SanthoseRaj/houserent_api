const express = require('express');
const { body } = require('express-validator');
const uploadController = require('../controllers/uploadController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const uploader = require('../middlewares/uploadMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();
const maxDocumentUploads = 12;
const maxPropertyImageUploads = 12;

router.post(
  '/documents',
  protect,
  uploader.array('files', maxDocumentUploads),
  uploadController.uploadDocuments,
);
router.post(
  '/property-images',
  protect,
  authorize('admin'),
  uploader.array('files', maxPropertyImageUploads),
  uploadController.uploadPropertyImages,
);
router.patch(
  '/documents/:id/status',
  protect,
  authorize('admin'),
  [
    body('verificationStatus')
      .isIn(['pending', 'verified', 'rejected'])
      .withMessage('Invalid verification status'),
  ],
  validateRequest,
  uploadController.updateDocumentStatus,
);

module.exports = router;
