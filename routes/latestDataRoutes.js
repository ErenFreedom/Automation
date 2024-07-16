const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const latestDataController = require('../controllers/latestDataController');

// Route to get the latest data from all tables
router.get('/latest', authenticateToken, latestDataController.getLatestData);

module.exports = router;
