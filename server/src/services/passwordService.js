const bcrypt = require('bcryptjs');
const config = require('../config/env');

const hashPassword = (password) => bcrypt.hash(password, config.bcryptSaltRounds);

const comparePassword = (password, passwordHash) =>
  bcrypt.compare(password, passwordHash);

module.exports = {
  comparePassword,
  hashPassword
};
