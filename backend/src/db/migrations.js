'use strict';

const db = require('./database');

const MIGRATIONS = [
  {
    name: 'create_users_table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        username   VARCHAR(50)  NOT NULL UNIQUE,
        email      VARCHAR(255) NOT NULL UNIQUE,
        password   TEXT         NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: 'create_user_ui_states_table',
    sql: `
      CREATE TABLE IF NOT EXISTS user_ui_states (
        user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        active_tab VARCHAR(50)  NOT NULL DEFAULT 'chi-so',
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
];

/**
 * Chạy tất cả migrations theo thứ tự.
 * Dùng CREATE TABLE IF NOT EXISTS nên idempotent (chạy nhiều lần vẫn an toàn).
 */
async function runMigrations() {
  console.log('[DB] Running migrations...');

  for (const migration of MIGRATIONS) {
    try {
      await db.query(migration.sql);
      console.log(`[DB] Migration OK: ${migration.name}`);
    } catch (err) {
      console.error(`[DB] Migration FAILED: ${migration.name}`, err.message);
      throw err;
    }
  }

  console.log('[DB] All migrations completed.');
}

module.exports = { runMigrations };
