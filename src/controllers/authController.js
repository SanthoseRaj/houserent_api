const dayjs = require('dayjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');
const { USER_ROLES, USER_STATUS } = require('../constants/appConstants');
const { generateOtp } = require('../utils/security');
const { sendOtpEmail } = require('../utils/email');
const env = require('../config/env');

const getModel = (accountType) => (accountType === USER_ROLES.ADMIN ? Admin : User);
const normalizeEmail = (value = '') => value.toString().trim().toLowerCase();
const normalizePhone = (value = '') => value.toString().replace(/\D/g, '');

const sanitizeAccount = (account, role) => ({
  id: account._id,
  role,
  ...(role === USER_ROLES.ADMIN
    ? {
        name: account.name,
        phone: account.phone,
        email: account.email,
      }
    : {
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        alternatePhone: account.alternatePhone,
        address: account.address,
        aadhaarNumber: account.aadhaarNumber,
        occupation: account.occupation,
        income: account.income,
        status: account.status,
        profilePhotoUrl: account.profilePhotoUrl,
      }),
});

const createAuthResponse = (account, role) => ({
  token: generateToken({ id: account._id, role }),
  user: sanitizeAccount(account, role),
});

const signupUser = catchAsync(async (req, res) => {
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
    otp: undefined,
  });

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: createAuthResponse(user, USER_ROLES.USER),
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const accountType = req.body.accountType || USER_ROLES.USER;
  const Model = getModel(accountType);
  const account = await Model.findOne({ email: normalizeEmail(req.body.email) }).select('+password');

  if (!account || !account.otp?.code) {
    throw new ApiError(404, 'OTP request not found');
  }

  if (account.otp.code !== req.body.otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (account.otp.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP expired');
  }

  if (accountType === USER_ROLES.USER) {
    account.isEmailVerified = true;
    account.status = USER_STATUS.ACTIVE;
  }

  account.otp = undefined;
  await account.save();

  return res.json({
    success: true,
    message: 'OTP verified successfully',
    data: createAuthResponse(account, accountType),
  });
});

const loginUser = catchAsync(async (req, res) => {
  const user = await User.findOne({ phone: normalizePhone(req.body.phone) }).select('+password');

  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(403, 'Your account is suspended');
  }

  return res.json({
    success: true,
    message: 'Login successful',
    data: createAuthResponse(user, USER_ROLES.USER),
  });
});

const loginAdmin = catchAsync(async (req, res) => {
  const admin = await Admin.findOne({ phone: normalizePhone(req.body.phone) }).select('+password');

  if (!admin || !(await admin.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid admin credentials');
  }

  return res.json({
    success: true,
    message: 'Login successful',
    data: createAuthResponse(admin, USER_ROLES.ADMIN),
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const accountType = req.body.accountType || USER_ROLES.USER;
  const Model = getModel(accountType);
  const account = await Model.findOne({ email: normalizeEmail(req.body.email) });

  if (!account) {
    throw new ApiError(404, 'Account not found');
  }

  const otp = generateOtp();
  account.otp = {
    code: otp,
    expiresAt: dayjs().add(env.otpExpiryMinutes, 'minute').toDate(),
    purpose: req.body.purpose || 'signup',
  };
  await account.save();

  await sendOtpEmail({
    to: account.email,
    name: account.fullName || account.name,
    otp,
    purpose: account.otp.purpose,
  });

  return res.json({
    success: true,
    message: 'OTP resent successfully',
    data: env.devOtpResponse ? { devOtp: otp } : {},
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const accountType = req.body.accountType || USER_ROLES.USER;
  const Model = getModel(accountType);
  const account = await Model.findOne({ email: normalizeEmail(req.body.email) });

  if (!account) {
    throw new ApiError(404, 'Account not found');
  }

  const otp = generateOtp();
  account.otp = {
    code: otp,
    expiresAt: dayjs().add(env.otpExpiryMinutes, 'minute').toDate(),
    purpose: 'reset-password',
  };
  await account.save();

  await sendOtpEmail({
    to: account.email,
    name: account.fullName || account.name,
    otp,
    purpose: 'password reset',
  });

  return res.json({
    success: true,
    message: 'Password reset OTP sent',
    data: env.devOtpResponse ? { devOtp: otp } : {},
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const accountType = req.body.accountType || USER_ROLES.USER;
  const Model = getModel(accountType);
  const account = await Model.findOne({ email: normalizeEmail(req.body.email) }).select('+password');

  if (!account || account.otp?.purpose !== 'reset-password') {
    throw new ApiError(400, 'Password reset request not found');
  }

  if (account.otp.code !== req.body.otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (account.otp.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP expired');
  }

  account.password = req.body.newPassword;
  account.otp = undefined;
  await account.save();

  return res.json({
    success: true,
    message: 'Password reset successful',
  });
});

const getCurrentAccount = catchAsync(async (req, res) => {
  res.json({
    success: true,
    data: sanitizeAccount(req.user, req.userRole),
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const updates =
    req.userRole === USER_ROLES.ADMIN
      ? {
          name: req.body.name || req.user.name,
          phone: req.body.phone ? normalizePhone(req.body.phone) : req.user.phone,
        }
      : {
          fullName: req.body.fullName || req.user.fullName,
          phone: req.body.phone ? normalizePhone(req.body.phone) : req.user.phone,
          alternatePhone: req.body.alternatePhone || req.user.alternatePhone,
          occupation: req.body.occupation || req.user.occupation,
          income: req.body.income ?? req.user.income,
          address: {
            current: req.body.address?.current || req.user.address?.current,
            permanent: req.body.address?.permanent || req.user.address?.permanent,
          },
          aadhaarNumber: req.body.aadhaarNumber || req.user.aadhaarNumber,
          profilePhotoUrl: req.body.profilePhotoUrl || req.user.profilePhotoUrl,
        };

  Object.assign(req.user, updates);
  await req.user.save();

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    data: sanitizeAccount(req.user, req.userRole),
  });
});

module.exports = {
  signupUser,
  verifyOtp,
  loginUser,
  loginAdmin,
  resendOtp,
  forgotPassword,
  resetPassword,
  getCurrentAccount,
  updateProfile,
};
