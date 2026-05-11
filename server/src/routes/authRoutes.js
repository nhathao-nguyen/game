const express = require('express');
const createAuthController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

const createAuthRoutes = ({ authService }) => {
  const router = express.Router();
  const authController = createAuthController(authService);

  router.post('/auth/register', asyncHandler(authController.register));
  router.post('/auth/login', asyncHandler(authController.login));

  return router;
};

module.exports = createAuthRoutes;
