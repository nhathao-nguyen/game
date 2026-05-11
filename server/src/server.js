const app = require('./app');
const config = require('./config/env');
const { closeDatabase } = require('./data/database');
const { initializeDatabase } = require('./data/initDatabase');

const startServer = async () => {
  config.validateRuntimeConfig();
  await initializeDatabase();

  const server = app.listen(config.port, () => {
    console.log(`${config.appName} listening on port ${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);

    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });

    setTimeout(() => {
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('Failed to start server');
  console.error(error);
  process.exit(1);
});
