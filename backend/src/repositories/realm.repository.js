'use strict';

const db = require('../db/database');

async function findById(id) {
  const res = await db.query('SELECT * FROM realms WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function findByLevel(level) {
  const res = await db.query('SELECT * FROM realms WHERE level = $1', [level]);
  return res.rows[0] || null;
}

async function findNextRealm(currentLevel) {
  const res = await db.query('SELECT * FROM realms WHERE level = $1', [currentLevel + 1]);
  return res.rows[0] || null;
}

module.exports = { findById, findByLevel, findNextRealm };
