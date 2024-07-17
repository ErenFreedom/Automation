const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/sensorDataController');

// Fetch last sensor data for each API and stream sensor data using SSE
router.get('/fetch-last-sensor-data-each-api', sensorDataController.fetchAndStreamSensorData);
router.get('/stream', sensorDataController.fetchAndStreamSensorData);

module.exports = router;
