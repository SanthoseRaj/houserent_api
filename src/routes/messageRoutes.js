const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { messageValidator } = require('../validators/messageValidators');

const router = express.Router();

router.get('/threads', protect, messageController.listThreads);
router.get('/thread/:participantId', protect, messageController.getThread);
router.post('/', protect, messageValidator, validateRequest, messageController.sendMessage);

module.exports = router;
