const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/sensorDataController');

// Fetch last sensor data for each API
router.get('/fetch-last-sensor-data-each-api', sensorDataController.fetchLastSensorDataForEachAPI);

module.exports = router;
