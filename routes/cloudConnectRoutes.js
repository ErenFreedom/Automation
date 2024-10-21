const express = require('express');
const { check } = require('express-validator');
const { cloudLogin, connectToDatabase } = require('../controllers/connectToDatabase');
const router = express.Router();

// Route for cloud login
router.post('/cloud-login', [
    check('identifier', 'Identifier (email/username) is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
], cloudLogin);

// Route for connecting to RDS via activation key and inserting data
router.post(
    '/connect-to-database',
    [
        check('activationKey', 'Activation key is required').not().isEmpty(),
        check('tableName', 'Table name is required').not().isEmpty(),
        check('data', 'Data is required').not().isEmpty()
    ],
    connectToDatabase
);

module.exports = router;
