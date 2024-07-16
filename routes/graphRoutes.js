const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const graphController = require('../controllers/graphController');

// Routes to get data for graphs
router.get('/graph/temp/:filter', authenticateToken, graphController.getTempData);
router.get('/graph/pressure/:filter', authenticateToken, graphController.getPressureData);
router.get('/graph/humidity/:filter', authenticateToken, graphController.getHumidityData);
router.get('/graph/rh/:filter', authenticateToken, graphController.getRhData);

module.exports = router;
