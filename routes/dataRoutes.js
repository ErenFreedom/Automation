const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const dataController = require('../controllers/dataController');

// Route to receive data for fetched_data table
router.post('/data', authenticateToken, dataController.insertData);

// Route to receive data for temp table
router.post('/data/temp', authenticateToken, dataController.insertTempData);

// Route to receive data for pressure table
router.post('/data/pressure', authenticateToken, dataController.insertPressureData);

// Route to receive data for humidity table
router.post('/data/humidity', authenticateToken, dataController.insertHumidityData);

// Route to receive data for rh table
router.post('/data/rh', authenticateToken, dataController.insertRhData);

module.exports = router;
