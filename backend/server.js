'use strict';

const env = require('./src/config/env');
const app = require('./src/app');
const { testConnection } = require('./src/db/database');
const { runMigrations } = require('./src/db/migrations');
const { runSeeds } = require('./src/db/seeds');

async function start() {
  try {
    // 1. Kiểm tra kết nối DB
    await testConnection();

    // 2. Chạy migrations (tạo bảng nếu chưa có)
    await runMigrations();

    // 3. Seed data mặc định (realms, enemies)
    await runSeeds();

    // 3. Start HTTP server
    const server = app.listen(env.port, () => {
      console.log(`\n🚀 Server running on port ${env.port}`);
      console.log(`   Environment : ${env.nodeEnv}`);
      console.log(`   Health check: http://localhost:${env.port}/health\n`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n[${signal}] Shutting down...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
