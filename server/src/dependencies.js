const database = require('./data/database');
const createUserRepository = require('./repositories/userRepository');
const { createAuthService } = require('./services/authService');
const passwordService = require('./services/passwordService');
const tokenService = require('./services/tokenService');

const userRepository = createUserRepository(database);
const authService = createAuthService({
  passwordService,
  tokenService,
  userRepository
});

module.exports = {
  authService,
  userRepository
};
