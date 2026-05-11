'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepo = require('../repositories/user.repository');

const { AppError } = require('../utils/AppError');

/**
 * Tạo JWT token cho user.
 * @param {{ id: number, email: string }} user
 */
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

/**
 * Đăng ký user mới.
 * @param {{ username: string, email: string, password: string }} data
 */
async function register({ username, email, password }) {
  // Kiểm tra email đã tồn tại chưa
  const existingByEmail = await userRepo.findByEmail(email);
  if (existingByEmail) {
    throw new AppError('Email đã được sử dụng', 409);
  }

  // Kiểm tra username đã tồn tại chưa
  const existingByUsername = await userRepo.findByUsername(username);
  if (existingByUsername) {
    throw new AppError('Tên người dùng đã được sử dụng', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, env.bcrypt.saltRounds);

  // Lưu vào database
  const newUser = await userRepo.create({
    username,
    email,
    password: hashedPassword,
  });

  // Tạo token ngay sau khi đăng ký
  const token = generateToken(newUser);

  return { user: newUser, token };
}

/**
 * Đăng nhập.
 * @param {{ email: string, password: string }} credentials
 */
async function login({ email, password }) {
  // Tìm user kèm password hash
  const user = await userRepo.findByEmail(email);

  // Dùng thông báo chung để tránh tiết lộ email có tồn tại không
  const invalidError = new AppError('Email hoặc mật khẩu không đúng', 401);

  if (!user) {
    throw invalidError;
  }

  // So sánh password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw invalidError;
  }

  // Trả về user không kèm password
  const { password: _omit, ...safeUser } = user;
  const token = generateToken(safeUser);

  return { user: safeUser, token };
}

module.exports = { register, login, AppError };
