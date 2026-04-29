const dayjs = require('dayjs');
const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const Property = require('../models/Property');
const RentalApplication = require('../models/RentalApplication');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  APPLICATION_STATUS,
  PAYMENT_STATUS,
  PROPERTY_STATUS,
  USER_STATUS,
} = require('../constants/appConstants');

const normalizeEmail = (value = '') => value.toString().trim().toLowerCase();
const normalizePhone = (value = '') => value.toString().replace(/\D/g, '');

const getDashboard = catchAsync(async (_req, res) => {
  const currentMonth = dayjs().format('MMMM YYYY');
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  const [
    totalProperties,
    availableProperties,
    occupiedProperties,
    pendingApplications,
    approvedTenants,
    monthlyRentCollectionResult,
    paidThisMonth,
    totalComplaints,
  ] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ status: PROPERTY_STATUS.AVAILABLE }),
    Property.countDocuments({ status: PROPERTY_STATUS.OCCUPIED }),
    RentalApplication.countDocuments({ status: APPLICATION_STATUS.SUBMITTED }),
    Property.countDocuments({ tenantId: { $ne: null } }),
    Payment.aggregate([
      {
        $match: {
          status: PAYMENT_STATUS.PAID,
          paidDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]),
    Payment.countDocuments({
      month: currentMonth,
      status: PAYMENT_STATUS.PAID,
    }),
    Complaint.countDocuments(),
  ]);

  const duePayments = Math.max(occupiedProperties - paidThisMonth, 0);

  return res.json({
    success: true,
    data: {
      totalProperties,
      availableProperties,
      occupiedProperties,
      pendingApplications,
      approvedTenants,
      monthlyRentCollection: monthlyRentCollectionResult[0]?.total || 0,
      duePayments,
      totalComplaints,
    },
  });
});

const getUsers = catchAsync(async (_req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return res.json({ success: true, data: users });
});

const getManagedProperties = catchAsync(async (_req, res) => {
  const properties = await Property.find().populate('tenantId', 'fullName email phone').sort({ createdAt: -1 });
  return res.json({ success: true, data: properties });
});

const createUserByAdmin = catchAsync(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists with this email or phone number');
  }

  const user = await User.create({
    ...req.body,
    email,
    phone,
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
  });

  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.status = req.body.status || user.status;
  await user.save();

  return res.json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

const getPaymentReport = catchAsync(async (req, res) => {
  const year = Number(req.query.year || dayjs().year());
  const start = dayjs(`${year}-01-01`).startOf('year').toDate();
  const end = dayjs(`${year}-12-31`).endOf('year').toDate();

  const report = await Payment.aggregate([
    {
      $match: {
        status: PAYMENT_STATUS.PAID,
        paidDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $month: '$paidDate' },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.json({
    success: true,
    data: report,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);
  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingAdmin) {
    throw new ApiError(409, 'Admin already exists with this email or phone number');
  }

  const admin = await Admin.create({
    name: req.body.name,
    phone,
    email,
    password: req.body.password,
  });

  return res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: {
      id: admin._id,
      name: admin.name,
      phone: admin.phone,
      email: admin.email,
      role: admin.role,
    },
  });
});

module.exports = {
  getDashboard,
  getUsers,
  getManagedProperties,
  createUserByAdmin,
  updateUserStatus,
  getPaymentReport,
  createAdmin,
};
