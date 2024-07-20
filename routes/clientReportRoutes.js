const express = require('express');
const router = express.Router();
const clientReportController = require('../controllers/clientReportController');

router.post('/generate-report', clientReportController.generateReport);

module.exports = router;
