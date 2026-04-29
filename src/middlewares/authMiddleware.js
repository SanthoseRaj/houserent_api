const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { USER_ROLES, USER_STATUS } = require('../constants/appConstants');

const getModelByRole = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return Admin;
  }

  if (role === USER_ROLES.USER) {
    return User;
  }

  return null;
};

const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const Model = getModelByRole(decoded.role);

    if (!Model) {
      throw new ApiError(401, 'Invalid token role');
    }

    const account = await Model.findById(decoded.id).select('+password');

    if (!account) {
      throw new ApiError(401, 'Account no longer exists');
    }

    if (decoded.role === USER_ROLES.USER && account.status === USER_STATUS.SUSPENDED) {
      throw new ApiError(403, 'Your account is suspended');
    }

    req.user = account;
    req.userRole = decoded.role;
    req.userModel = decoded.role === USER_ROLES.ADMIN ? 'Admin' : 'User';

    return next();
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(401, 'Invalid or expired token'));
  }
};

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.userRole)) {
    return next(new ApiError(403, 'You are not allowed to perform this action'));
  }

  return next();
};

module.exports = {
  protect,
  authorize,
};
