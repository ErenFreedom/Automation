const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const authenticateToken = require('../middlewares/authenticateToken');

// Route to view a query
router.post('/view-query', authenticateToken, statusController.viewQuery);

// Route to close a query
router.post('/close-query', authenticateToken, statusController.closeQuery);

// Route to get all queries for a department
router.get('/queries/:department', authenticateToken, statusController.getQueries);

// Route to get details of a specific query
router.get('/query-details/:queryId', authenticateToken, statusController.getQueryDetails);

// Route to get query status for a specific client
router.get('/client-query-status/:clientEmail', authenticateToken, statusController.getClientQueryStatus);

module.exports = router;
