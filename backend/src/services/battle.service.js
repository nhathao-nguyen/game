'use strict';

const { pool }    = require('../db/database');
const battleRepo  = require('../repositories/battle.repository');
const charRepo    = require('../repositories/character.repository');
const cultivSvc   = require('./cultivation.service');
const engine      = require('./combat.engine');
const { AppError }= require('../utils/AppError');

async function startBattle(userId) {
  const status = await cultivSvc.getStatus(userId);
  const char   = await charRepo.findByUserId(userId);

  // Kiểm tra đang có battle chưa
  const existing = await battleRepo.findActiveByCharacterId(char.id);
  if (existing) {
    // Trả về battle đang active thay vì lỗi
    return { battle_id: existing.id, state: existing.state_json, resumed: true };
  }

  const enemy = await battleRepo.findRandomEnemy(status.realm.level);
  if (!enemy) throw new AppError('Không tìm thấy kẻ địch', 500, 'NO_ENEMY');

  // Build initial state
  const state = {
    player: {
      hp: char.hp_current, hp_max: char.hp_max,
      atk: char.atk, def: char.def, spd: char.spd,
    },
    enemy: {
      name: enemy.name, hp: enemy.hp_base, hp_max: enemy.hp_base,
      atk: enemy.atk_base, def: enemy.def_base, spd: enemy.spd_base,
    },
    turn: 1,
    log: [],
  };

  const battle = await battleRepo.create({ characterId: char.id, enemyId: enemy.id, stateJson: state });
  return { battle_id: battle.id, state, resumed: false };
}

async function processAction(userId, battleId, action) {
  const VALID_ACTIONS = ['attack', 'skill', 'heal', 'flee'];
  if (!VALID_ACTIONS.includes(action)) {
    throw new AppError('Hành động không hợp lệ', 422, 'INVALID_ACTION');
  }

  const char   = await charRepo.findByUserId(userId);
  const battle = await battleRepo.findById(battleId);

  if (!battle)                          throw new AppError('Không tìm thấy trận chiến', 404, 'BATTLE_NOT_FOUND');
  if (battle.character_id !== char.id)  throw new AppError('Không có quyền', 403, 'FORBIDDEN');
  if (battle.status !== 'active')       throw new AppError('Trận chiến đã kết thúc', 400, 'BATTLE_ENDED');

  let state = battle.state_json;

  // --- Player turn ---
  const { fled, logEntry: playerLog, state: afterPlayer } = engine.processPlayerAction(state, action);
  state = afterPlayer;
  state.log.push({ turn: state.turn, ...playerLog });

  if (fled) {
    await battleRepo.update(pool, battleId, { status: 'fled', ended_at: new Date() });
    return { status: 'fled', state, rewards: null };
  }

  // Check enemy dead after player attack
  if (state.enemy.hp <= 0) {
    return await endBattle(pool, battle, char, state, 'won');
  }

  // --- Enemy turn ---
  const aiWeights = battle.ai_weights || { attack: 70, skill: 20, defend: 10 };
  const { logEntry: enemyLog, state: afterEnemy } = engine.processEnemyTurn(state, aiWeights);
  state = afterEnemy;
  state.log.push({ turn: state.turn, ...enemyLog });
  state.turn += 1;

  // Check player dead
  if (state.player.hp <= 0) {
    return await endBattle(pool, battle, char, state, 'lost');
  }

  // Save state
  await battleRepo.update(pool, battleId, { state_json: JSON.stringify(state), turn_count: state.turn });
  return { status: 'active', state, rewards: null };
}

async function endBattle(client, battle, char, state, status) {
  const enemy   = await battleRepo.findRandomEnemy(1); // get enemy details
  const rawEnemy = await pool.query('SELECT * FROM enemies WHERE id=$1', [battle.enemy_id]);
  const enemyData = rawEnemy.rows[0];

  let expGained = 0;
  let linhThachGained = 0;

  if (status === 'won' && enemyData) {
    expGained       = enemyData.exp_reward;
    linhThachGained = enemyData.linh_thach_min +
      Math.floor(Math.random() * (enemyData.linh_thach_max - enemyData.linh_thach_min + 1));
  }

  const txClient = await pool.connect();
  try {
    await txClient.query('BEGIN');

    await battleRepo.update(txClient, battle.id, {
      status,
      state_json: JSON.stringify(state),
      exp_gained: expGained,
      linh_thach_gained: linhThachGained,
      ended_at: new Date(),
    });

    if (status === 'won') {
      // Bước 6: exp → tăng tuvi_rate, cộng linh thạch
      const newRate      = Math.floor(char.tuvi_rate * 1 + Math.floor(expGained / 100));
      const updatedRate  = Math.max(char.tuvi_rate, newRate);
      await txClient.query(
        `UPDATE characters SET
           exp          = exp + $1,
           linh_thach   = linh_thach + $2,
           tuvi_rate    = GREATEST(tuvi_rate, $3),
           hp_current   = $4,
           updated_at   = NOW()
         WHERE id = $5`,
        [expGained, linhThachGained, updatedRate, state.player.hp, char.id]
      );
    } else {
      // Thua: HP về 1 (không chết hẳn)
      await txClient.query(
        `UPDATE characters SET hp_current = 1, updated_at = NOW() WHERE id = $1`,
        [char.id]
      );
    }

    await txClient.query('COMMIT');
  } catch (err) {
    await txClient.query('ROLLBACK');
    throw err;
  } finally {
    txClient.release();
  }

  return {
    status,
    state,
    rewards: status === 'won' ? { exp: expGained, linh_thach: linhThachGained } : null,
  };
}

async function getBattle(userId, battleId) {
  const char   = await charRepo.findByUserId(userId);
  const battle = await battleRepo.findById(battleId);
  if (!battle || battle.character_id !== char.id) {
    throw new AppError('Không tìm thấy trận chiến', 404, 'BATTLE_NOT_FOUND');
  }
  return { battle_id: battle.id, status: battle.status, state: battle.state_json };
}

module.exports = { startBattle, processAction, getBattle };
