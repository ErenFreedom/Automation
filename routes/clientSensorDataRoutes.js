const express = require('express');
const router = express.Router();
const clientSensorDataController = require('../controllers/clientSensorDataController');

router.get('/fetch-last-sensor-data-each-api', clientSensorDataController.fetchLastSensorDataForEachAPI);
router.get('/stream', clientSensorDataController.streamSensorData);

module.exports = router;
