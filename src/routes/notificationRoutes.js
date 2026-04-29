const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, notificationController.getNotifications);
router.patch('/:id/read', protect, notificationController.markAsRead);
router.post('/announcement', protect, authorize('admin'), notificationController.createAnnouncement);

module.exports = router;
