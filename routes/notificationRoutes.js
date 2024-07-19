const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const notificationsController = require('../controllers/notificationController');
const thresholdController = require('../controllers/thresholdController');

// Route to set multiple thresholds
router.post('/set-thresholds', authenticateToken, thresholdController.setThresholds);

// Route to get notifications
router.get('/get-notifications', authenticateToken, notificationsController.getNotifications);

// Temporary route to manually trigger threshold check for testing
router.get('/test-threshold-check', (req, res) => {
    notificationsController.checkThresholds();
    res.status(200).send('Threshold check triggered');
});

module.exports = router;
