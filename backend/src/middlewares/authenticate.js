'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Middleware xác thực JWT. Attach user vào req.user nếu hợp lệ.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Yêu cầu xác thực' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token hết hạn hoặc không hợp lệ' });
  }
}

module.exports = { authenticate };
