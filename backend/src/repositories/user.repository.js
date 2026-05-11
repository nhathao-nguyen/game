'use strict';

const db = require('../db/database');

/**
 * Tìm user theo email.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findByEmail(email) {
  const res = await db.query(
    'SELECT id, username, email, password, created_at FROM users WHERE email = $1 LIMIT 1',
    [email.toLowerCase()]
  );
  return res.rows[0] || null;
}

/**
 * Tìm user theo username.
 * @param {string} username
 * @returns {Promise<object|null>}
 */
async function findByUsername(username) {
  const res = await db.query(
    'SELECT id, username, email, created_at FROM users WHERE username = $1 LIMIT 1',
    [username.toLowerCase()]
  );
  return res.rows[0] || null;
}

/**
 * Tìm user theo id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const res = await db.query(
    'SELECT id, username, email, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return res.rows[0] || null;
}

/**
 * Tạo user mới.
 * @param {{ username: string, email: string, password: string }} data
 * @returns {Promise<object>} User mới (không có password)
 */
async function create({ username, email, password }) {
  const res = await db.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username.toLowerCase(), email.toLowerCase(), password]
  );
  return res.rows[0];
}

module.exports = { findByEmail, findByUsername, findById, create };
