const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const notificationController = require('../controllers/notificationController');

// Get notifications for a user
router.get('/notifications', authenticateToken, notificationController.getNotifications);

// Mark notifications as read
router.put('/notifications/mark-read', authenticateToken, notificationController.markNotificationsAsRead);

module.exports = router;
