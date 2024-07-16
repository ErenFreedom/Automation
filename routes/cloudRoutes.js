const express = require('express');
const router = express.Router();
const cloudController = require('../controllers/cloudController');

// Route to check account credentials and store sensor APIs
router.post('/check-account', cloudController.checkAccount);

// Route to add sensor data
router.post('/add-sensor-data', cloudController.addSensorData);

module.exports = router;
