const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

router.post('/receive-query', statusController.receiveQuery);
router.post('/close-query', statusController.closeQuery);
router.get('/client-queries/:clientEmail', statusController.getClientQueries);

module.exports = router;
