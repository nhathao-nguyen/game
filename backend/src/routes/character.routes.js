'use strict';

const { Router }      = require('express');
const { authenticate }= require('../middlewares/authenticate');
const ctrl            = require('../controllers/character.controller');

const router = Router();
router.use(authenticate);

router.get('/status',       ctrl.getStatus);
router.post('/cultivate',   ctrl.cultivate);
router.post('/breakthrough',ctrl.breakthrough);

module.exports = router;
