'use strict';

const uiStateRepo = require('../repositories/uiState.repository');

/**
 * Lưu trạng thái UI của user.
 * @param {{ userId: number, activeTab: string }} data
 */
async function saveUIState({ userId, activeTab }) {
  if (!activeTab || typeof activeTab !== 'string') {
    const err = new Error('activeTab không hợp lệ');
    err.statusCode = 422;
    err.isOperational = true;
    throw err;
  }
  await uiStateRepo.upsertUIState({ userId, activeTab });
}

module.exports = { saveUIState };
