'use strict';

const uiStateService = require('../services/uiState.service');

/**
 * POST /user/ui-state
 * Lưu tab hiện tại của user.
 */
async function updateUIState(req, res, next) {
  try {
    const { activeTab } = req.body;
    const userId = req.user.id;

    await uiStateService.saveUIState({ userId, activeTab });

    res.status(200).json({
      success: true,
      message: 'Đã lưu trạng thái UI',
      data: { userId, activeTab },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateUIState };
