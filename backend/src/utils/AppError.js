'use strict';

class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;         // machine-readable error code, VD: 'INSUFFICIENT_TUVI'
    this.isOperational = true;
  }
}

module.exports = { AppError };
