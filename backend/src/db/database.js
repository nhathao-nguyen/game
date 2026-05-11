'use strict';

const { Pool } = require('pg');
const env = require('../config/env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  // Render PostgreSQL yêu cầu SSL trên production
  ssl: env.isProd() ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Chạy một câu query với optional parameters.
 * @param {string} text - SQL query string
 * @param {Array} [params] - Query parameters
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (env.isDev()) {
    console.log(`[DB] query="${text}" duration=${duration}ms rows=${res.rowCount}`);
  }

  return res;
}

/**
 * Kiểm tra kết nối database.
 */
async function testConnection() {
  const res = await query('SELECT NOW() AS now');
  console.log('[DB] Connected. Server time:', res.rows[0].now);
}

module.exports = { query, testConnection, pool };
