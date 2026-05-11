'use strict';

const db = require('../db/database');

async function findActiveByCharacterId(characterId) {
  const res = await db.query(
    `SELECT b.*, e.name AS enemy_name, e.ai_weights, e.realm_level
     FROM battles b
     JOIN enemies e ON b.enemy_id = e.id
     WHERE b.character_id = $1 AND b.status = 'active'
     LIMIT 1`,
    [characterId]
  );
  return res.rows[0] || null;
}

async function findById(id) {
  const res = await db.query(
    `SELECT b.*, e.name AS enemy_name, e.ai_weights
     FROM battles b JOIN enemies e ON b.enemy_id = e.id
     WHERE b.id = $1 LIMIT 1`,
    [id]
  );
  return res.rows[0] || null;
}

async function create({ characterId, enemyId, stateJson }) {
  const res = await db.query(
    `INSERT INTO battles (character_id, enemy_id, state_json)
     VALUES ($1, $2, $3::jsonb) RETURNING id`,
    [characterId, enemyId, JSON.stringify(stateJson)]
  );
  return findById(res.rows[0].id);
}

async function update(client, id, fields) {
  const keys = Object.keys(fields);
  const vals = Object.values(fields);
  const set  = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const res  = await client.query(
    `UPDATE battles SET ${set} WHERE id = $1 RETURNING *`,
    [id, ...vals]
  );
  return res.rows[0];
}

async function findRandomEnemy(realmLevel) {
  const res = await db.query(
    `SELECT * FROM enemies WHERE realm_level = $1 ORDER BY RANDOM() LIMIT 1`,
    [realmLevel]
  );
  if (res.rows[0]) return res.rows[0];
  // fallback level 1
  const fb = await db.query(`SELECT * FROM enemies ORDER BY RANDOM() LIMIT 1`);
  return fb.rows[0] || null;
}

module.exports = { findActiveByCharacterId, findById, create, update, findRandomEnemy };
