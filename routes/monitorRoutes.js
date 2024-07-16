// routes/monitorRoutes.js
const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');

// Route to get alerts
router.get('/alerts', monitorController.checkThresholds);

module.exports = router;
