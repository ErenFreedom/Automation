const express = require('express');
const { check } = require('express-validator');
const authClientController = require('../controllers/authClientController');

const router = express.Router();

router.post('/register-client', [
    check('email', 'Valid email is required').isEmail(),
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty(),
    check('gender', 'Gender is required').not().isEmpty(),
    check('age', 'Age is required').not().isEmpty(),
    check('phoneNumber', 'Phone number is required').not().isEmpty()
], authClientController.registerClient);

router.post('/verify-client-registration', authClientController.verifyClientRegistration);

router.post('/login-client', [
    check('identifier', 'Email or Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty()
], authClientController.loginClient);

router.post('/verify-client-login', authClientController.verifyClientLogin);

module.exports = router;
