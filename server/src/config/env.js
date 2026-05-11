const dotenv = require('dotenv');

dotenv.config();

const REQUIRED_PRODUCTION_ENV = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'CORS_ORIGIN'
];

const normalizeApiPrefix = (value) => {
  const prefix = (value || '/api/v1').trim();
  const withLeadingSlash = prefix.startsWith('/') ? prefix : `/${prefix}`;

  if (withLeadingSlash.length === 1) {
    return withLeadingSlash;
  }

  return withLeadingSlash.replace(/\/+$/, '');
};

const parseCorsOrigin = (value) => {
  const rawValue = (value || '*').trim();

  if (rawValue === '*') {
    return '*';
  }

  return rawValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const parsePort = (value) => {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return 3000;
};

const nodeEnv = process.env.NODE_ENV || 'development';

const validateRuntimeConfig = () => {
  if (nodeEnv !== 'production') {
    return;
  }

  const missingVariables = REQUIRED_PRODUCTION_ENV.filter(
    (key) => !process.env[key] || !process.env[key].trim()
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}`
    );
  }

  if (!Number.isInteger(Number(process.env.PORT)) || Number(process.env.PORT) <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  if (process.env.JWT_SECRET.trim().length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters');
  }
};

module.exports = {
  apiPrefix: normalizeApiPrefix(process.env.API_PREFIX),
  appName: process.env.APP_NAME || 'react-tutien-api',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
  databaseUrl: process.env.DATABASE_URL || '',
  isProduction: nodeEnv === 'production',
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '1mb',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtSecret:
    process.env.JWT_SECRET ||
    (nodeEnv === 'test' ? 'test-secret-with-enough-length' : ''),
  nodeEnv,
  port: parsePort(process.env.PORT),
  validateRuntimeConfig
};
