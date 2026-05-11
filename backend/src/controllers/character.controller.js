'use strict';

const cultivSvc = require('../services/cultivation.service');

async function getStatus(req, res, next) {
  try {
    const data = await cultivSvc.getStatus(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function cultivate(req, res, next) {
  try {
    const { action } = req.body; // 'start' | 'stop'
    if (!['start', 'stop'].includes(action)) {
      return res.status(422).json({ success: false, error: 'action phải là start hoặc stop', code: 'INVALID_ACTION' });
    }
    const data = await cultivSvc.toggleCultivation(req.user.id, action);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function breakthrough(req, res, next) {
  try {
    const data = await cultivSvc.breakthrough(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { getStatus, cultivate, breakthrough };
