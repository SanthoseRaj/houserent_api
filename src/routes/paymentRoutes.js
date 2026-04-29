const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/checkout-session', protect, authorize('user'), paymentController.createCheckoutSession);
router.get('/verify-session/:sessionId', protect, authorize('user'), paymentController.verifyCheckoutSession);
router.get('/mine', protect, authorize('user'), paymentController.getMyPayments);
router.get('/', protect, authorize('admin'), paymentController.getPayments);
router.get('/receipt/:id', protect, paymentController.getReceipt);

module.exports = router;
