const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const reportController = require('../controllers/reportController');

// Route to generate report
router.post('/generate-report', authenticateToken, reportController.generateReport);

module.exports = router;
