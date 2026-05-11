'use strict';

const battleSvc = require('../services/battle.service');

async function start(req, res, next) {
  try {
    const data = await battleSvc.startBattle(req.user.id);
    res.status(data.resumed ? 200 : 201).json({ success: true, data });
  } catch (err) { next(err); }
}

async function action(req, res, next) {
  try {
    const { battle_id, action } = req.body;
    if (!battle_id || !action) {
      return res.status(422).json({ success: false, error: 'Thiếu battle_id hoặc action' });
    }
    const data = await battleSvc.processAction(req.user.id, battle_id, action);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function getState(req, res, next) {
  try {
    const data = await battleSvc.getBattle(req.user.id, parseInt(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { start, action, getState };
