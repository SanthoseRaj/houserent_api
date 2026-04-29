const ApiError = require('../utils/ApiError');

const notFound = (_req, _res, next) => next(new ApiError(404, 'Route not found'));

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'Internal server error',
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Each file must be 10 MB or smaller',
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'You can upload up to 12 documents at a time',
      });
    }
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${Object.keys(error.keyValue).join(', ')}`,
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource identifier',
    });
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  notFound,
  errorHandler,
};
