const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

// Staff Registration
router.post('/register-staff', [
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('name').not().isEmpty().withMessage('Name is required'),
    check('gender').not().isEmpty().withMessage('Gender is required'),
    check('age').isInt().withMessage('Age must be an integer'),
    check('phoneNumber').not().isEmpty().withMessage('Phone Number is required'),
    check('department').not().isEmpty().withMessage('Department is required')
], authController.registerStaff);

router.post('/verify-staff-registration', [
    check('otp').isNumeric().withMessage('OTP must be numeric').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits long')
], authController.verifyStaffRegistration);

// Existing user registration


// Login
router.post('/login', [
    check('identifier').isLength({ min: 3 }).withMessage('Identifier must be at least 3 characters long'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authController.login);

router.post('/verify-login', [
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('otp').isNumeric().withMessage('OTP must be numeric').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits long')
], authController.verifyLogin);

module.exports = router;
