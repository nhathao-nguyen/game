'use strict';

const db = require('./database');

const MIGRATIONS = [
  // ─── Auth & UI ────────────────────────────────────────────────────────────
  {
    name: 'create_users_table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        username   VARCHAR(50)  NOT NULL UNIQUE,
        email      VARCHAR(255) NOT NULL UNIQUE,
        password   TEXT         NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: 'create_user_ui_states_table',
    sql: `
      CREATE TABLE IF NOT EXISTS user_ui_states (
        user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        active_tab VARCHAR(50)  NOT NULL DEFAULT 'chi-so',
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },

  // ─── 01. realms (cảnh giới) ───────────────────────────────────────────────
  // Bảng config cảnh giới — không hardcode trong code.
  // level = thứ tự cảnh giới (1 = thấp nhất).
  // tuvi_required = tổng tu vi cần tích lũy để MỞ KHOÁ đột phá vào cảnh giới này.
  // tuvi_cap      = giới hạn tu vi tối đa trong cảnh giới này.
  // base_rate     = tu vi/giây cơ bản khi tu luyện.
  // bt_base_chance = xác suất đột phá thành công cơ bản (0-1).
  {
    name: 'create_realms_table',
    sql: `
      CREATE TABLE IF NOT EXISTS realms (
        id               SERIAL PRIMARY KEY,
        name             VARCHAR(100)    NOT NULL UNIQUE,
        level            INTEGER         NOT NULL UNIQUE,
        tuvi_required    BIGINT          NOT NULL DEFAULT 0,
        tuvi_cap         BIGINT          NOT NULL,
        base_rate        INTEGER         NOT NULL DEFAULT 1,
        bt_base_chance   DECIMAL(5,4)   NOT NULL DEFAULT 0.80,
        atk_bonus        DECIMAL(5,2)   NOT NULL DEFAULT 1.00,
        def_bonus        DECIMAL(5,2)   NOT NULL DEFAULT 1.00,
        hp_bonus         DECIMAL(5,2)   NOT NULL DEFAULT 1.00,
        description      TEXT,
        created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
      );
    `,
  },

  // ─── 02. characters (nhân vật) ────────────────────────────────────────────
  // Mỗi user có 1 nhân vật (UNIQUE user_id). Tách bảng khỏi users để sau này
  // có thể mở rộng multi-character mà không cần đổi auth.
  //
  // tuvi_current   = tu vi hiện tại trong cảnh giới này (reset về 0 sau đột phá).
  // tuvi_rate      = tu vi/giây thực tế (base_rate × linh_căn × pháp_bảo bonus).
  // last_synced_at = mốc thời gian tính offline progress.
  // is_cultivating = đang tu luyện hay không.
  // spirit_root    = linh căn ảnh hưởng tốc độ tu luyện.
  // exp            = kinh nghiệm (tăng từ battle).
  // linh_thach     = tiền tệ chính (drop từ battle, dùng trong tiệm).
  {
    name: 'create_characters_table',
    sql: `
      CREATE TABLE IF NOT EXISTS characters (
        id               SERIAL PRIMARY KEY,
        user_id          INTEGER         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name             VARCHAR(100)    NOT NULL DEFAULT 'Tu Sĩ',
        realm_id         INTEGER         NOT NULL DEFAULT 1 REFERENCES realms(id),

        -- Tu vi
        tuvi_current     BIGINT          NOT NULL DEFAULT 0,
        tuvi_rate        INTEGER         NOT NULL DEFAULT 1,
        is_cultivating   BOOLEAN         NOT NULL DEFAULT FALSE,
        last_synced_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

        -- Chỉ số chiến đấu
        hp_current       INTEGER         NOT NULL DEFAULT 100,
        hp_max           INTEGER         NOT NULL DEFAULT 100,
        atk              INTEGER         NOT NULL DEFAULT 10,
        def              INTEGER         NOT NULL DEFAULT 5,
        spd              INTEGER         NOT NULL DEFAULT 10,

        -- Linh căn (ảnh hưởng tu vi rate)
        -- 'trash'=x0.5 | 'normal'=x1 | 'good'=x1.5 | 'excellent'=x2 | 'heavenly'=x3
        spirit_root      VARCHAR(20)     NOT NULL DEFAULT 'normal',
        spirit_root_mult DECIMAL(4,2)    NOT NULL DEFAULT 1.00,

        -- Tài nguyên
        exp              BIGINT          NOT NULL DEFAULT 0,
        linh_thach       BIGINT          NOT NULL DEFAULT 0,

        -- Meta
        created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `,
  },

  // ─── 03. breakthrough_logs (lịch sử đột phá) ─────────────────────────────
  // Audit trail cho mỗi lần thử đột phá — dùng để balance game và debug.
  // chance_rolled = số ngẫu nhiên server roll (0-1).
  // final_chance  = xác suất thực tế sau các bonus item/buff.
  // success       = chance_rolled < final_chance.
  {
    name: 'create_breakthrough_logs_table',
    sql: `
      CREATE TABLE IF NOT EXISTS breakthrough_logs (
        id               SERIAL PRIMARY KEY,
        character_id     INTEGER         NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
        from_realm_id    INTEGER         NOT NULL REFERENCES realms(id),
        to_realm_id      INTEGER         NOT NULL REFERENCES realms(id),
        success          BOOLEAN         NOT NULL,
        chance_rolled    DECIMAL(5,4)    NOT NULL,
        final_chance     DECIMAL(5,4)    NOT NULL,
        tuvi_lost_pct    DECIMAL(5,4)    NOT NULL DEFAULT 0.30,
        created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `,
  },

  // ─── 04. enemies (kẻ địch) ────────────────────────────────────────────────
  // Bảng config — không hardcode enemy trong code.
  // realm_level = cảnh giới tương đương (dùng để matchmaking).
  // ai_weights  = JSONB trọng số hành động của AI.
  //   VD: {"attack": 60, "skill": 25, "defend": 15}
  //   Server dùng weighted random để chọn action mỗi lượt.
  // drop_table  = JSONB danh sách vật phẩm có thể drop.
  {
    name: 'create_enemies_table',
    sql: `
      CREATE TABLE IF NOT EXISTS enemies (
        id               SERIAL PRIMARY KEY,
        name             VARCHAR(100)    NOT NULL,
        realm_level      INTEGER         NOT NULL,
        hp_base          INTEGER         NOT NULL,
        atk_base         INTEGER         NOT NULL,
        def_base         INTEGER         NOT NULL,
        spd_base         INTEGER         NOT NULL,
        exp_reward       INTEGER         NOT NULL DEFAULT 0,
        linh_thach_min   INTEGER         NOT NULL DEFAULT 0,
        linh_thach_max   INTEGER         NOT NULL DEFAULT 0,
        ai_weights       JSONB           NOT NULL DEFAULT '{"attack":70,"skill":20,"defend":10}',
        drop_table       JSONB           NOT NULL DEFAULT '[]',
        description      TEXT,
        created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `,
  },

  // ─── 05. battles (trận chiến) ─────────────────────────────────────────────
  // Toàn bộ state trận chiến lưu trong state_json để:
  //   1. Server là nguồn sự thật duy nhất (chống gian lận).
  //   2. Có thể resume battle nếu client crash.
  //
  // state_json schema:
  // {
  //   "player": { "hp": 80, "hp_max": 100, "atk": 15, "def": 8, "spd": 10 },
  //   "enemy":  { "hp": 45, "hp_max": 60,  "atk": 12, "def": 5, "spd": 8  },
  //   "turn": 3,
  //   "log": [
  //     { "turn":1, "actor":"player", "action":"attack",
  //       "damage":10, "crit":false, "dodge":false,
  //       "text":"Bạn tấn công Yêu Thú gây 10 sát thương!" }
  //   ]
  // }
  //
  // status: 'active' | 'won' | 'lost' | 'fled'
  {
    name: 'create_battles_table',
    sql: `
      CREATE TABLE IF NOT EXISTS battles (
        id                 SERIAL PRIMARY KEY,
        character_id       INTEGER         NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
        enemy_id           INTEGER         NOT NULL REFERENCES enemies(id),
        state_json         JSONB           NOT NULL,
        status             VARCHAR(10)     NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','won','lost','fled')),
        turn_count         INTEGER         NOT NULL DEFAULT 0,
        exp_gained         INTEGER,
        linh_thach_gained  INTEGER,
        created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        ended_at           TIMESTAMPTZ,

        -- Chỉ 1 battle active tại một thời điểm
        CONSTRAINT one_active_battle EXCLUDE USING btree
          (character_id WITH =) WHERE (status = 'active')
      );
    `,
  },
];


/**
 * Chạy tất cả migrations theo thứ tự.
 * Dùng CREATE TABLE IF NOT EXISTS nên idempotent (chạy nhiều lần vẫn an toàn).
 */
async function runMigrations() {
  console.log('[DB] Running migrations...');

  for (const migration of MIGRATIONS) {
    try {
      await db.query(migration.sql);
      console.log(`[DB] Migration OK: ${migration.name}`);
    } catch (err) {
      console.error(`[DB] Migration FAILED: ${migration.name}`, err.message);
      throw err;
    }
  }

  console.log('[DB] All migrations completed.');
}

module.exports = { runMigrations };
