'use strict';

const db = require('./database');

// ─── Seed data ────────────────────────────────────────────────────────────────
// Chạy UPSERT (INSERT ... ON CONFLICT DO UPDATE) để idempotent.

const REALMS = [
  // level | name          | tuvi_required | tuvi_cap    | rate | bt_chance | atk  | def  | hp
  [1,  'Luyện Khí',        0,              10_000,        1,    0.95, 1.00, 1.00, 1.00, 'Bước đầu tiên trên con đường tu tiên. Cơ thể bắt đầu hấp thụ linh khí thiên địa.'],
  [2,  'Trúc Cơ',          10_000,         150_000,       3,    0.85, 1.20, 1.15, 1.20, 'Nền móng tu luyện được củng cố. Cơ thể cứng chắc hơn, linh lực sung mãn.'],
  [3,  'Kim Đan',          150_000,        2_000_000,     8,    0.75, 1.50, 1.40, 1.50, 'Kim đan hình thành trong đan điền — cột mốc quan trọng của tu sĩ.'],
  [4,  'Nguyên Anh',       2_000_000,      30_000_000,    20,   0.65, 2.00, 1.80, 2.00, 'Nguyên anh xuất khiếu — có thể rời thể xác. Tuổi thọ tăng gấp bội.'],
  [5,  'Hóa Thần',         30_000_000,     500_000_000,   50,   0.55, 2.80, 2.50, 2.80, 'Linh hồn hóa thần — kiểm soát thiên địa linh khí trong vùng rộng lớn.'],
  [6,  'Luyện Hư',         500_000_000,    8_000_000_000, 120,  0.45, 4.00, 3.50, 4.00, 'Cảnh giới bán tiên — có thể chiếu không gian, phá hư không.'],
  [7,  'Hợp Thể',          8_000_000_000,  9_007_199_254_740_991, 300, 0.35, 6.00, 5.00, 6.00, 'Thể xác hợp nhất với linh hồn — tiếp cận cảnh giới bất tử.'],
  [8,  'Đại Thừa',         9_007_199_254_740_991, 9_007_199_254_740_991, 700, 0.25, 9.00, 7.50, 9.00, 'Bước cuối trước khi vượt qua thiên kiếp thành tiên.'],
  [9,  'Độ Kiếp',          9_007_199_254_740_991, 9_007_199_254_740_991, 1500, 0.15, 15.00, 12.00, 15.00, 'Vượt qua thiên lôi kiếp nạn — bước vào cửa tiên giới.'],
];

const ENEMIES = [
  // name              | realm_level | hp  | atk | def | spd | exp | lt_min | lt_max | ai_weights
  ['Yêu Thú Nhỏ',      1, 50,   8,  2,  6,  15,  2,   8,   '{"attack":80,"skill":10,"defend":10}', 'Một con thú nhỏ có chút linh khí, thích hợp để tu sĩ mới rèn luyện.'],
  ['Thổ Linh Thú',     1, 80,   10, 4,  5,  25,  5,   15,  '{"attack":70,"skill":15,"defend":15}', 'Thú đất có da dày, phòng thủ tốt nhưng chậm chạp.'],
  ['Hắc Lang Yêu',     2, 150,  18, 8,  10, 60,  12,  30,  '{"attack":65,"skill":25,"defend":10}', 'Sói đen đột biến hấp thụ linh khí, hung hãn và nhanh nhẹn.'],
  ['Hỏa Điểu Yêu',     2, 120,  22, 6,  14, 80,  15,  40,  '{"attack":60,"skill":35,"defend":5}',  'Chim lửa có khả năng phun hỏa cầu, sát thương cao nhưng máu ít.'],
  ['Thạch Khổng Lồ',   3, 400,  30, 20, 4,  180, 30,  80,  '{"attack":50,"skill":10,"defend":40}', 'Quái vật đá khổng lồ, phòng thủ cực cao nhưng chậm chạp.'],
  ['Độc Xà Tinh',      3, 280,  35, 12, 16, 200, 40,  100, '{"attack":55,"skill":40,"defend":5}',  'Rắn độc tu tiên lâu năm, biết dùng độc thuật và tốc độ rất nhanh.'],
  ['Thiết Giáp Hùng',  4, 800,  50, 35, 8,  500, 80,  200, '{"attack":45,"skill":20,"defend":35}', 'Gấu sắt cảnh giới Nguyên Anh, ngoại cứng trong cương.'],
  ['Phong Linh Điểu',  4, 600,  60, 25, 22, 600, 100, 250, '{"attack":50,"skill":45,"defend":5}',  'Đại bàng gió có thể tạo lốc xoáy kinh người.'],
  ['Hỏa Kỳ Lân',       5, 2000, 90, 55, 15, 1500, 200, 500, '{"attack":40,"skill":50,"defend":10}', 'Kỳ lân lửa huyền thoại, khả năng tái sinh khi máu thấp.'],
  ['Hắc Long Tinh',    5, 3000, 100,60, 12, 2000, 300, 800, '{"attack":35,"skill":55,"defend":10}', 'Rồng đen tu hành nghìn năm — trùm khu vực Hóa Thần.'],
];

async function seedRealms() {
  for (const [level, name, tuvi_required, tuvi_cap, base_rate, bt_base_chance,
               atk_bonus, def_bonus, hp_bonus, description] of REALMS) {
    await db.query(
      `INSERT INTO realms
         (level, name, tuvi_required, tuvi_cap, base_rate, bt_base_chance,
          atk_bonus, def_bonus, hp_bonus, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (level) DO UPDATE SET
         name            = EXCLUDED.name,
         tuvi_required   = EXCLUDED.tuvi_required,
         tuvi_cap        = EXCLUDED.tuvi_cap,
         base_rate       = EXCLUDED.base_rate,
         bt_base_chance  = EXCLUDED.bt_base_chance,
         atk_bonus       = EXCLUDED.atk_bonus,
         def_bonus       = EXCLUDED.def_bonus,
         hp_bonus        = EXCLUDED.hp_bonus,
         description     = EXCLUDED.description`,
      [level, name, tuvi_required, tuvi_cap, base_rate, bt_base_chance,
       atk_bonus, def_bonus, hp_bonus, description]
    );
  }
  console.log(`[Seed] Realms: ${REALMS.length} records upserted.`);
}

async function seedEnemies() {
  for (const [name, realm_level, hp_base, atk_base, def_base, spd_base,
               exp_reward, linh_thach_min, linh_thach_max, ai_weights, description] of ENEMIES) {
    await db.query(
      `INSERT INTO enemies
         (name, realm_level, hp_base, atk_base, def_base, spd_base,
          exp_reward, linh_thach_min, linh_thach_max, ai_weights, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)
       ON CONFLICT DO NOTHING`,
      [name, realm_level, hp_base, atk_base, def_base, spd_base,
       exp_reward, linh_thach_min, linh_thach_max, ai_weights, description]
    );
  }
  console.log(`[Seed] Enemies: ${ENEMIES.length} records inserted.`);
}

async function runSeeds() {
  console.log('[Seed] Running seeds...');
  await seedRealms();
  await seedEnemies();
  console.log('[Seed] All seeds completed.');
}

module.exports = { runSeeds };
