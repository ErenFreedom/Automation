const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

router.post('/raise-query', queryController.uploadMiddleware, queryController.raiseQuery);

module.exports = router;
