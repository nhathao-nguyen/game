const express = require('express');
const createAuthRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');

const createRoutes = (dependencies) => {
  const router = express.Router();

  router.use(healthRoutes);
  router.use(createAuthRoutes(dependencies));

  return router;
};

module.exports = createRoutes;
