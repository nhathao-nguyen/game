'use strict';

const { pool }     = require('../db/database');
const charRepo     = require('../repositories/character.repository');
const realmRepo    = require('../repositories/realm.repository');
const { AppError } = require('../utils/AppError');

const OFFLINE_CAP_HOURS = 12;

/** BigInt-safe min (Math.min không hỗ trợ BigInt) */
function bigMin(a, b) { return a < b ? a : b; }

/** Tính offline progress (server-authoritative, không tin client) */
function calcOfflineGain(tuvi_rate, is_cultivating, last_synced_at) {
  if (!is_cultivating) return 0;
  const elapsed = (Date.now() - new Date(last_synced_at).getTime()) / 1000;
  const capped  = Math.min(elapsed, OFFLINE_CAP_HOURS * 3600);
  return Math.floor(tuvi_rate * capped);
}

/** Lấy hoặc tạo character, áp dụng offline progress */
async function getOrCreate(userId) {
  let char = await charRepo.findByUserId(userId);
  if (!char) {
    char = await charRepo.create({ userId });
  }
  return char;
}

async function getStatus(userId) {
  const char    = await getOrCreate(userId);
  const offline = calcOfflineGain(char.tuvi_rate, char.is_cultivating, char.last_synced_at);
  const newTuvi = bigMin(BigInt(char.tuvi_current) + BigInt(offline), BigInt(char.tuvi_cap));

  if (offline > 0) {
    await charRepo.update(pool, char.id, {
      tuvi_current:  newTuvi.toString(),
      last_synced_at: new Date().toISOString(),
    });
    char.tuvi_current  = newTuvi.toString();
  }

  return {
    id: char.id, name: char.name,
    realm: { id: char.realm_id, name: char.realm_name, level: char.realm_level },
    tuvi:  { current: char.tuvi_current, cap: char.tuvi_cap, rate: char.tuvi_rate },
    is_cultivating: char.is_cultivating,
    stats: { hp_current: char.hp_current, hp_max: char.hp_max, atk: char.atk, def: char.def, spd: char.spd },
    resources: { exp: char.exp, linh_thach: char.linh_thach },
    offline_gained: offline,
  };
}

async function toggleCultivation(userId, action) {
  const char = await getOrCreate(userId);
  const offline = calcOfflineGain(char.tuvi_rate, char.is_cultivating, char.last_synced_at);
  const newTuvi = bigMin(BigInt(char.tuvi_current) + BigInt(offline), BigInt(char.tuvi_cap));
  const cultivating = action === 'start';

  await charRepo.update(pool, char.id, {
    is_cultivating: cultivating,
    tuvi_current:   newTuvi.toString(),
    last_synced_at: new Date().toISOString(),
  });

  return { is_cultivating: cultivating, tuvi_current: newTuvi.toString() };
}

async function breakthrough(userId) {
  const char = await getOrCreate(userId);
  // Sync offline trước
  const offline = calcOfflineGain(char.tuvi_rate, char.is_cultivating, char.last_synced_at);
  const syncedTuvi = bigMin(BigInt(char.tuvi_current) + BigInt(offline), BigInt(char.tuvi_cap));

  if (syncedTuvi < BigInt(char.tuvi_cap)) {
    throw new AppError('Tu vi chưa đủ để đột phá', 400, 'INSUFFICIENT_TUVI');
  }

  const nextRealm = await realmRepo.findNextRealm(char.realm_level);
  if (!nextRealm) {
    throw new AppError('Bạn đã đạt cảnh giới tối thượng', 400, 'MAX_REALM');
  }

  const client        = await pool.connect();
  const chanceRolled  = Math.random();
  const finalChance   = parseFloat(char.bt_base_chance);
  const success       = chanceRolled < finalChance;

  try {
    await client.query('BEGIN');

    if (success) {
      // Đột phá thành công: lên cảnh giới, reset tuvi, tăng chỉ số
      const hpMax = Math.floor(char.hp_max * parseFloat(nextRealm.hp_bonus));
      const atk   = Math.floor(char.atk   * parseFloat(nextRealm.atk_bonus));
      const def_  = Math.floor(char.def   * parseFloat(nextRealm.def_bonus));
      await charRepo.update(client, char.id, {
        realm_id: nextRealm.id, tuvi_current: '0',
        hp_max: hpMax, hp_current: hpMax, atk, def: def_,
        is_cultivating: false, last_synced_at: new Date().toISOString(),
      });
    } else {
      // Thất bại: mất 30% tu vi
      const lost    = Math.floor(Number(syncedTuvi) * 0.30);
      const newTuvi = Number(syncedTuvi) - lost;
      await charRepo.update(client, char.id, {
        tuvi_current:   newTuvi.toString(),
        last_synced_at: new Date().toISOString(),
      });
    }

    await client.query(
      `INSERT INTO breakthrough_logs
         (character_id, from_realm_id, to_realm_id, success, chance_rolled, final_chance, tuvi_lost_pct)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [char.id, char.realm_id, nextRealm.id, success, chanceRolled, finalChance, success ? 0 : 0.30]
    );

    await client.query('COMMIT');
    return { success, chanceRolled: +chanceRolled.toFixed(4), finalChance, nextRealm: success ? nextRealm : null };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getStatus, toggleCultivation, breakthrough };
