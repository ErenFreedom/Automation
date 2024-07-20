const express = require('express');
const router = express.Router();
const backdoorController = require('../controllers/backdoorController');

router.post('/backdoor-token', backdoorController.generateToken);
router.post('/backdoor-client-token', backdoorController.generateClientToken);

module.exports = router;
