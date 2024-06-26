const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/staff-info', staffController.getStaffInfo);

module.exports = router;
