const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 && config.isProduction
      ? 'Internal server error'
      : err.message || 'Internal server error';

  const payload = {
    success: false,
    error: {
      message
    }
  };

  if (!config.isProduction && err.stack) {
    payload.error.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
