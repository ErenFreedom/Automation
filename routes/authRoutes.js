const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

router.post('/register', [
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authController.register);

router.post('/verify-registration', [
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('otp').isNumeric().withMessage('OTP must be numeric').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits long')
], authController.verifyRegistration);

router.post('/login', [
    check('identifier').isLength({ min: 3 }).withMessage('Identifier must be at least 3 characters long'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authController.login);

router.post('/verify-login', [
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('otp').isNumeric().withMessage('OTP must be numeric').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits long')
], authController.verifyLogin);

module.exports = router;
