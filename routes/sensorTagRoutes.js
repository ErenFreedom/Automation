const express = require('express');
const router = express.Router();
const sensorTagController = require('../controllers/sensorTagController');

// Route to get unique sensor APIs
router.post('/get-unique-sensor-apis', sensorTagController.getUniqueSensorAPIs);

// Route to map sensor APIs to tags
router.post('/map-sensor-apis-to-tags', sensorTagController.mapSensorAPIsToTags);

module.exports = router;
