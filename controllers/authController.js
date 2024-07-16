const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
require('dotenv').config();
const { generateOTP, sendOTPEmail, decryptData } = require('../utils/otpGeneration');

const secretKey = process.env.SECRET_KEY;

// Register a new user
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;
    const decryptedPassword = decryptData(password);

    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkQuery, [email, username], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Error checking user');
        }

        if (results.length > 0) {
            return res.status(400).send('Email or Username already exists');
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

        const insertOtpQuery = 'INSERT INTO otps (email, otp, expires_at, password, username) VALUES (?, ?, ?, ?, ?)';
        db.query(insertOtpQuery, [email, otp, expiresAt, decryptedPassword, username], async (err) => {
            if (err) {
                console.error('Error storing OTP:', err);
                return res.status(500).send('Error storing OTP');
            }
            console.log(`OTP ${otp} stored for email ${email}`);
            await sendOTPEmail(email, otp);
            res.status(200).send('OTP sent to your email. Complete registration by verifying the OTP.');
        });
    });
};

// Verify OTP and complete registration
exports.verifyRegistration = async (req, res) => {
    const { email, otp } = req.body;
    const checkOtpQuery = 'SELECT * FROM otps WHERE email = ? AND otp = ?';
    db.query(checkOtpQuery, [email, otp], async (err, results) => {
        if (err || results.length === 0) {
            console.error(`Invalid or expired OTP for email ${email}`);
            return res.status(400).send('Invalid or expired OTP.');
        }

        const otpData = results[0];
        if (new Date() > new Date(otpData.expires_at)) {
            console.error(`Expired OTP for email ${email}`);
            return res.status(400).send('Invalid or expired OTP.');
        }

        const hashedPassword = await bcrypt.hash(otpData.password, 10);
        const query = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
        db.query(query, [email, otpData.username, hashedPassword], (err) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).send('Error registering user');
            }

            const deleteOtpQuery = 'DELETE FROM otps WHERE email = ?';
            db.query(deleteOtpQuery, [email], (err) => {
                if (err) {
                    console.error('Error deleting OTP:', err);
                }
            });

            res.send('User registered successfully');
        });
    });
};

// Login user
exports.login = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body; // identifier can be email or username
    const decryptedPassword = decryptData(password);

    const query = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(query, [identifier, identifier], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }
        const user = results[0];
        const validPassword = await bcrypt.compare(decryptedPassword, user.password);
        if (!validPassword) {
            return res.status(401).send('Invalid credentials');
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

        const insertOtpQuery = 'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)';
        db.query(insertOtpQuery, [user.email, otp, expiresAt], async (err) => {
            if (err) {
                console.error('Error storing OTP:', err);
                return res.status(500).send('Error storing OTP');
            }
            console.log(`OTP ${otp} stored for email ${user.email}`);
            await sendOTPEmail(user.email, otp);
            res.status(200).json({ email: user.email, userId: user.id }); // Return email and userId
        });
    });
};

// Verify OTP and complete login
exports.verifyLogin = async (req, res) => {
    const { email, otp } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('Invalid identifier.');
        }

        const user = results[0];
        const checkOtpQuery = 'SELECT * FROM otps WHERE email = ? AND otp = ?';
        db.query(checkOtpQuery, [email, otp], (err, results) => {
            if (err || results.length === 0) {
                console.error(`Invalid or expired OTP for email ${email}`);
                return res.status(400).send('Invalid or expired OTP.');
            }

            const otpData = results[0];
            if (new Date() > new Date(otpData.expires_at)) {
                console.error(`Expired OTP for email ${email}`);
                return res.status(400).send('Invalid or expired OTP.');
            }

            const token = jwt.sign({ email: user.email, userId: user.id }, secretKey, { expiresIn: '1h' });

            const deleteOtpQuery = 'DELETE FROM otps WHERE email = ?';
            db.query(deleteOtpQuery, [email], (err) => {
                if (err) {
                    console.error('Error deleting OTP:', err);
                }
            });

            res.json({ token });
        });
    });
};
