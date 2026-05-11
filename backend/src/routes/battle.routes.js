'use strict';

const { Router }      = require('express');
const { authenticate }= require('../middlewares/authenticate');
const ctrl            = require('../controllers/battle.controller');

const router = Router();
router.use(authenticate);

router.post('/start',    ctrl.start);
router.post('/action',   ctrl.action);
router.get('/:id',       ctrl.getState);

module.exports = router;
