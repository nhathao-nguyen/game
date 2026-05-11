'use strict';

const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

/**
 * Lấy validation errors từ request, nếu có thì trả 422.
 */
function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      error: 'Dữ liệu không hợp lệ',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return false;
  }
  return true;
}

/**
 * POST /auth/register
 */
async function register(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 */
async function login(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
