'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middlewares/authenticate');
const userController = require('../controllers/user.controller');

const router = Router();

// Tất cả /user routes đều cần xác thực
router.use(authenticate);

router.post(
  '/ui-state',
  [body('activeTab').trim().notEmpty().withMessage('activeTab không được để trống')],
  userController.updateUIState
);

module.exports = router;
