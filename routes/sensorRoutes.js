const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const authenticateToken = require('../middlewares/authenticateToken');

// Fetch all sensors for the authenticated user (client or staff)
router.get('/sensors', authenticateToken, sensorController.getAllSensors);

// Fetch sensor data for a specific sensor
router.get('/sensors/:sensorId/data', authenticateToken, sensorController.getSensorData);

module.exports = router;
