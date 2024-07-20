const express = require('express');
const router = express.Router();
const clientGraphController = require('../controllers/clientGraphController');

router.get('/1day', clientGraphController.getDataForAllAPIs1Day);
router.get('/1week', clientGraphController.getDataForAllAPIs1Week);
router.get('/1month', clientGraphController.getDataForAllAPIs1Month);

module.exports = router;
