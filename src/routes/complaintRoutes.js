const express = require('express');
const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { complaintValidator } = require('../validators/complaintValidators');

const router = express.Router();

router.post('/', protect, authorize('user'), complaintValidator, validateRequest, complaintController.createComplaint);
router.get('/', protect, complaintController.getComplaints);
router.patch('/:id', protect, authorize('admin'), complaintController.updateComplaint);

module.exports = router;
