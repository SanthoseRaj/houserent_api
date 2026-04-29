const express = require('express');
const agreementController = require('../controllers/agreementController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const uploader = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', protect, agreementController.getAgreements);
router.get('/:id', protect, agreementController.getAgreementById);
router.post('/', protect, authorize('admin'), uploader.single('file'), agreementController.createAgreement);

module.exports = router;
