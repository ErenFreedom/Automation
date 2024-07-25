const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.post('/get-unique-sensor-apis', apiController.getUniqueSensorAPIs);
router.post('/map-sensor-apis-to-tags', apiController.mapSensorAPIsToTags);

module.exports = router;