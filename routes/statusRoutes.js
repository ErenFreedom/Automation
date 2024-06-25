const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

// Route to view a query
router.post('/view-query', statusController.viewQuery);

// Route to close a query
router.post('/close-query', statusController.closeQuery);

// Route to get all queries for a department
router.get('/queries/:department', statusController.getQueries);

module.exports = router;
