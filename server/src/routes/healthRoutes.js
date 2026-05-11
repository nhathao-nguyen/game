const express = require('express');
const healthController = require('../controllers/healthController');
const config = require('../config/env');

const router = express.Router();

router.get('/health', healthController.getHealth);
router.get(`${config.apiPrefix}/status`, healthController.getStatus);

module.exports = router;
