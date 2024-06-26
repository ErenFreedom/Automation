const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/staff-info', authenticateToken, staffController.getStaffInfo);

module.exports = router;
