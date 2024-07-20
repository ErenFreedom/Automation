const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const notificationsController = require('../controllers/notificationController');
const thresholdController = require('../controllers/thresholdController');

// Route to set multiple thresholds
router.post('/set-thresholds', authenticateToken, thresholdController.setThresholds);

// Route to get notifications
router.get('/get-notifications', authenticateToken, notificationsController.getNotifications);

// Route to get sensor APIs
router.get('/sensor-apis', authenticateToken, thresholdController.getSensorApis);

module.exports = router;
