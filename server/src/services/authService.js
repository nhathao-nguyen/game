const HttpError = require('../utils/httpError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const validateCredentials = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new HttpError(400, 'Email must be a valid email address');
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters');
  }

  return {
    email: normalizedEmail,
    password
  };
};

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email
});

const createAuthService = ({ passwordService, tokenService, userRepository }) => {
  const register = async (input) => {
    const credentials = validateCredentials(input);
    const existingUser = await userRepository.findByEmail(credentials.email);

    if (existingUser) {
      throw new HttpError(409, 'Email is already registered');
    }

    const passwordHash = await passwordService.hashPassword(credentials.password);

    let user;

    try {
      user = await userRepository.create({
        email: credentials.email,
        passwordHash
      });
    } catch (error) {
      if (error.code === 'USER_EMAIL_EXISTS') {
        throw new HttpError(409, 'Email is already registered');
      }

      throw error;
    }

    return {
      token: tokenService.signAuthToken(user),
      user: sanitizeUser(user)
    };
  };

  const login = async (input) => {
    const credentials = validateCredentials(input);
    const user = await userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const passwordMatches = await passwordService.comparePassword(
      credentials.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new HttpError(401, 'Invalid email or password');
    }

    return {
      token: tokenService.signAuthToken(user),
      user: sanitizeUser(user)
    };
  };

  return {
    login,
    register
  };
};

module.exports = {
  createAuthService
};
