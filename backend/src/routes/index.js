'use strict';

const { Router }      = require('express');
const authRoutes      = require('./auth.routes');
const userRoutes      = require('./user.routes');
const characterRoutes = require('./character.routes');
const battleRoutes    = require('./battle.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Auth routes
router.use('/auth', authRoutes);

// User routes (protected)
router.use('/user', userRoutes);

// Character & Cultivation
router.use('/character', characterRoutes);

// Battle
router.use('/battle', battleRoutes);

// 404 handler cho routes không tồn tại
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} không tồn tại`,
  });
});

module.exports = router;
