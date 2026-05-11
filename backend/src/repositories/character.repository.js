'use strict';

const db = require('../db/database');

async function findByUserId(userId) {
  const res = await db.query(
    `SELECT c.*, r.name AS realm_name, r.tuvi_cap, r.bt_base_chance,
            r.base_rate, r.level AS realm_level,
            r.atk_bonus, r.def_bonus, r.hp_bonus
     FROM characters c
     JOIN realms r ON c.realm_id = r.id
     WHERE c.user_id = $1 LIMIT 1`,
    [userId]
  );
  return res.rows[0] || null;
}

async function findById(id) {
  const res = await db.query(
    `SELECT c.*, r.name AS realm_name, r.tuvi_cap, r.bt_base_chance,
            r.base_rate, r.level AS realm_level,
            r.atk_bonus, r.def_bonus, r.hp_bonus
     FROM characters c
     JOIN realms r ON c.realm_id = r.id
     WHERE c.id = $1 LIMIT 1`,
    [id]
  );
  return res.rows[0] || null;
}

async function create({ userId }) {
  const res = await db.query(
    `INSERT INTO characters (user_id, realm_id, name)
     VALUES ($1, 1, 'Tu Sĩ') RETURNING id`,
    [userId]
  );
  return findById(res.rows[0].id);
}

async function update(client, id, fields) {
  // client = pool hoặc transaction client
  const keys = Object.keys(fields);
  const vals = Object.values(fields);
  const set  = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const res  = await client.query(
    `UPDATE characters SET ${set}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...vals]
  );
  return res.rows[0];
}

module.exports = { findByUserId, findById, create, update };
