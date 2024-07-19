const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Route to generate report
router.post('/generate-report', reportController.generateReport);

module.exports = router;
