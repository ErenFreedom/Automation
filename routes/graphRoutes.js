const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');

// Fetch filtered data for all APIs for 1 day
router.get('/fetch-data-all-apis-1day', graphController.getDataForAllAPIs1Day);

// Fetch filtered data for all APIs for 1 week
router.get('/fetch-data-all-apis-1week', graphController.getDataForAllAPIs1Week);

// Fetch filtered data for all APIs for 1 month
router.get('/fetch-data-all-apis-1month', graphController.getDataForAllAPIs1Month);

module.exports = router;
