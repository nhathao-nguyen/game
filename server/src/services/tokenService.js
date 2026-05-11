const jwt = require('jsonwebtoken');
const config = require('../config/env');

const signAuthToken = (user) => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is required to sign auth tokens');
  }

  return jwt.sign(
    {
      email: user.email
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
      issuer: config.appName,
      subject: user.id
    }
  );
};

module.exports = {
  signAuthToken
};
