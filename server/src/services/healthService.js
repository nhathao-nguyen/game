const packageJson = require('../../package.json');
const config = require('../config/env');

const buildBaseMetadata = () => ({
  name: config.appName,
  version: packageJson.version,
  environment: config.nodeEnv,
  timestamp: new Date().toISOString()
});

const getHealth = () => ({
  ...buildBaseMetadata(),
  status: 'ok',
  uptime: process.uptime()
});

const getStatus = () => ({
  ...buildBaseMetadata(),
  status: 'ok',
  apiPrefix: config.apiPrefix
});

module.exports = {
  getHealth,
  getStatus
};
