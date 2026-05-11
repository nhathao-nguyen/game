const { Pool } = require('pg');
const config = require('../config/env');

let pool;

const createPool = () =>
  new Pool({
    connectionString: config.databaseUrl,
    ssl: config.isProduction ? { rejectUnauthorized: false } : undefined
  });

const getPool = () => {
  if (!pool) {
    pool = createPool();
  }

  return pool;
};

const query = (text, params) => getPool().query(text, params);

const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};

module.exports = {
  closeDatabase,
  getPool,
  query
};
