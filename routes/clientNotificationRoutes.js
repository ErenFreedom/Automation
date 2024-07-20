const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const clientNotificationController = require('../controllers/clientNotificationController');
const clientThresholdController = require('../controllers/clientThresholdController');

// Route to set multiple thresholds
router.post('/set-thresholds', authenticateToken, clientThresholdController.setThresholds);

// Route to get notifications
router.get('/get-notifications', authenticateToken, clientNotificationController.getNotifications);

// Route to get sensor APIs
router.get('/sensor-apis', authenticateToken, clientThresholdController.getSensorApis);

router.get('/current-thresholds', authenticateToken, clientThresholdController.getCurrentThresholds);

module.exports = router;
