const cors = require('cors');
const express = require('express');
const config = require('./config/env');
const createRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const { createAuthService } = require('./services/authService');
const passwordService = require('./services/passwordService');
const tokenService = require('./services/tokenService');

const buildDependencies = (dependencies) => ({
  ...dependencies,
  authService:
    dependencies.authService ||
    createAuthService({
      passwordService,
      tokenService,
      userRepository: dependencies.userRepository
    })
});

const createApp = (dependencies) => {
  const appDependencies = buildDependencies(dependencies);
  const app = express();

  app.disable('x-powered-by');

  app.use(
    cors({
      allowedHeaders: ['Authorization', 'Content-Type'],
      methods: ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
      origin: config.corsOrigin
    })
  );
  app.use(express.json({ limit: config.jsonBodyLimit }));

  app.use(createRoutes(appDependencies));
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = {
  createApp
};
