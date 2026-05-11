'use strict';

const CRIT_CHANCE = 0.10;
const CRIT_MULT   = 1.50;

function calcDamage(atk, def, crit = false) {
  const base     = Math.max(1, atk - Math.floor(def * 0.5));
  const variance = 0.85 + Math.random() * 0.30;
  const raw      = Math.floor(base * variance);
  return crit ? Math.floor(raw * CRIT_MULT) : raw;
}

function rollCrit() { return Math.random() < CRIT_CHANCE; }

function rollDodge(targetSpd, attackerSpd) {
  const diff = (targetSpd - attackerSpd) * 0.008;
  return Math.random() < Math.max(0, Math.min(0.40, 0.04 + diff));
}

/** Weighted random pick từ { action: weight } */
function weightedRandom(weights) {
  const entries = Object.entries(weights);
  const total   = entries.reduce((s, [, w]) => s + w, 0);
  let   rand    = Math.random() * total;
  for (const [action, weight] of entries) {
    rand -= weight;
    if (rand <= 0) return action;
  }
  return entries[0][0];
}

/** Xử lý turn của PLAYER → trả về { fled, logEntry, state } */
function processPlayerAction(state, action) {
  const { player, enemy } = state;

  if (action === 'attack') {
    if (rollDodge(enemy.spd, player.spd)) {
      return { fled: false, logEntry: { actor: 'player', action, damage: 0, dodge: true,  crit: false, text: `${enemy.name} né tránh đòn tấn công!` }, state };
    }
    const crit   = rollCrit();
    const damage = calcDamage(player.atk, enemy.def, crit);
    enemy.hp     = Math.max(0, enemy.hp - damage);
    return { fled: false, logEntry: { actor: 'player', action, damage, dodge: false, crit,
      text: crit ? `⚡ Bạo kích! Gây ${damage} ST vào ${enemy.name}!`
                 : `Tấn công ${enemy.name} gây ${damage} ST.` }, state };
  }

  if (action === 'skill') {
    const damage = Math.floor(calcDamage(player.atk * 1.5, enemy.def));
    enemy.hp     = Math.max(0, enemy.hp - damage);
    return { fled: false, logEntry: { actor: 'player', action, damage, dodge: false, crit: false,
      text: `✨ Kỹ năng! Gây ${damage} linh lực ST vào ${enemy.name}!` }, state };
  }

  if (action === 'heal') {
    const healAmt   = Math.floor(player.hp_max * 0.25);
    const healed    = Math.min(healAmt, player.hp_max - player.hp);
    player.hp       = player.hp + healed;
    return { fled: false, logEntry: { actor: 'player', action, damage: 0, dodge: false, crit: false, healed,
      text: `💊 Dùng đan dược hồi ${healed} HP.` }, state };
  }

  if (action === 'flee') {
    const fled = Math.random() < 0.50;
    return { fled, logEntry: { actor: 'player', action, damage: 0, dodge: false, crit: false, fled,
      text: fled ? '🏃 Tháo chạy thành công!' : '❌ Tháo chạy thất bại!' }, state };
  }

  // default attack
  const damage = calcDamage(player.atk, enemy.def);
  enemy.hp     = Math.max(0, enemy.hp - damage);
  return { fled: false, logEntry: { actor: 'player', action: 'attack', damage, dodge: false, crit: false,
    text: `Tấn công ${enemy.name} gây ${damage} ST.` }, state };
}

/** Xử lý turn của ENEMY (AI) */
function processEnemyTurn(state, aiWeights) {
  const { player, enemy } = state;
  const action = weightedRandom(aiWeights);

  if (action === 'defend') {
    const heal = Math.floor(enemy.hp_max * 0.05);
    enemy.hp   = Math.min(enemy.hp_max, enemy.hp + heal);
    return { logEntry: { actor: 'enemy', action, damage: 0, dodge: false, crit: false,
      text: `${enemy.name} thu thủ phòng thủ.` }, state };
  }

  const atkMult = action === 'skill' ? 1.4 : 1.0;
  if (rollDodge(player.spd, enemy.spd)) {
    return { logEntry: { actor: 'enemy', action, damage: 0, dodge: true, crit: false,
      text: `Bạn né tránh đòn của ${enemy.name}!` }, state };
  }
  const crit   = rollCrit();
  const damage = calcDamage(enemy.atk * atkMult, player.def, crit);
  player.hp    = Math.max(0, player.hp - damage);
  return { logEntry: { actor: 'enemy', action, damage, dodge: false, crit,
    text: crit ? `💥 ${enemy.name} bạo kích gây ${damage} ST!`
               : `${enemy.name} ${action === 'skill' ? 'dùng kỹ năng' : 'tấn công'} gây ${damage} ST.` }, state };
}

module.exports = { processPlayerAction, processEnemyTurn, weightedRandom };
