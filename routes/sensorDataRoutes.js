const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/sensorDataController');

// Route for fetching last sensor data
router.get('/fetch-last-sensor-data-each-api', sensorDataController.fetchLastSensorDataForEachAPI);

// Route for streaming sensor data
router.get('/stream', sensorDataController.streamSensorData);

module.exports = router;
