const express = require('express');
const { check } = require('express-validator');
const { cloudLogin } = require('../controllers/cloudLogin');
const router = express.Router();

// Route for cloud login (staff or client)
router.post(
    '/cloudlogin',
    [
        check('identifier', 'Identifier (email/username) is required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
    ],
    cloudLogin
);

module.exports = router;
