const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register-staff', [
    check('email', 'Valid email is required').isEmail(),
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty(),
    check('gender', 'Gender is required').not().isEmpty(),
    check('age', 'Age is required').not().isEmpty(),
    check('phoneNumber', 'Phone number is required').not().isEmpty(),
    check('department', 'Department is required').not().isEmpty()
], authController.registerStaff);

router.post('/verify-staff-registration', authController.verifyStaffRegistration);

router.post('/login-staff', [
    check('identifier', 'Email or Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty()
], authController.login);

router.post('/verify-staff-login', [
    check('email', 'Email is required').isEmail(),
    check('otp', 'OTP must be numeric and 6 digits long').isNumeric().isLength({ min: 6, max: 6 })
], authController.verifyLogin);

module.exports = router;
