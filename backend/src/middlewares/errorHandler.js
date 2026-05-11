'use strict';

const { AppError } = require('../utils/AppError');

/**
 * Global error handler — Express nhận biết vì có 4 tham số (err, req, res, next).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Lỗi nghiệp vụ có statusCode (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Lỗi PostgreSQL — duplicate key
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Dữ liệu đã tồn tại trong hệ thống',
    });
  }

  // Lỗi không xác định — không lộ chi tiết ra ngoài
  console.error('[ERROR]', err);
  return res.status(500).json({
    success: false,
    error: 'Lỗi hệ thống, vui lòng thử lại sau',
  });
}

module.exports = { errorHandler, AppError };
