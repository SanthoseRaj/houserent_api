const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { signupValidator, phoneRule, passwordRule } = require('../validators/authValidators');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/properties', adminController.getManagedProperties);
router.get('/users', adminController.getUsers);
router.post('/users', signupValidator, validateRequest, adminController.createUserByAdmin);
router.patch(
  '/users/:id/status',
  [body('status').isIn(['pending_verification', 'active', 'suspended']).withMessage('Invalid user status')],
  validateRequest,
  adminController.updateUserStatus,
);
router.get('/reports/payments', adminController.getPaymentReport);
router.post(
  '/admins',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    phoneRule(),
    body('email').isEmail().withMessage('Valid email is required'),
    passwordRule().withMessage('Password must be strong'),
  ],
  validateRequest,
  adminController.createAdmin,
);

module.exports = router;
