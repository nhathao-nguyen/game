'use strict';

const db = require('../db/database');

/**
 * Upsert UI state cho user.
 * @param {{ userId: number, activeTab: string }} data
 */
async function upsertUIState({ userId, activeTab }) {
  await db.query(
    `INSERT INTO user_ui_states (user_id, active_tab, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET active_tab = $2, updated_at = NOW()`,
    [userId, activeTab]
  );
}

/**
 * Lấy UI state của user.
 * @param {number} userId
 */
async function getUIState(userId) {
  const res = await db.query(
    'SELECT active_tab, updated_at FROM user_ui_states WHERE user_id = $1',
    [userId]
  );
  return res.rows[0] || null;
}

module.exports = { upsertUIState, getUIState };
