const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
require('dotenv').config();
const { generateOTP, sendOTPEmail, decryptData } = require('../utils/otpGeneration');

const secretKey = process.env.SECRET_KEY;

// Register a new client
exports.registerClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password, name, gender, age, phoneNumber } = req.body;
    const decryptedPassword = decryptData(password);

    const checkQuery = 'SELECT * FROM clients WHERE email = ? OR username = ?';
    db.query(checkQuery, [email, username], async (err, results) => {
        if (err) {
            console.error('Error checking client:', err);
            return res.status(500).send('Error checking client');
        }

        if (results.length > 0) {
            return res.status(400).send('Email or Username already exists');
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

        const insertOtpQuery = 'INSERT INTO otps (email, otp, expires_at, password, username, name, gender, age, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(insertOtpQuery, [email, otp, expiresAt, decryptedPassword, username, name, gender, age, phoneNumber], async (err) => {
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

// Verify OTP and complete client registration
exports.verifyClientRegistration = async (req, res) => {
    const { email, otp } = req.body;
    console.log(`Verifying OTP for registration`);
    console.log(`Email: ${email}, OTP: ${otp}`);

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
        const query = 'INSERT INTO clients (email, username, password, name, gender, age, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [email, otpData.username, hashedPassword, otpData.name, otpData.gender, otpData.age, otpData.phoneNumber], (err) => {
            if (err) {
                console.error('Error registering client:', err);
                return res.status(500).send('Error registering client');
            }

            const deleteOtpQuery = 'DELETE FROM otps WHERE email = ?';
            db.query(deleteOtpQuery, [email], (err) => {
                if (err) {
                    console.error('Error deleting OTP:', err);
                }
            });

            res.send('Client registered successfully');
        });
    });
};

// Login client
exports.loginClient = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body; // identifier can be email or username
    const decryptedPassword = decryptData(password);

    const query = 'SELECT * FROM clients WHERE email = ? OR username = ?';
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
exports.verifyClientLogin = async (req, res) => {
    const { email, otp } = req.body;

    console.log(`Verifying OTP for client login`);
    console.log(`Email: ${email}, OTP: ${otp}`);
    
    if (!email || !otp) {
        console.error('Email or OTP not provided');
        return res.status(400).send('Email and OTP are required.');
    }

    const query = 'SELECT * FROM clients WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            console.error(`Invalid identifier for email: ${email}`);
            return res.status(400).send('Invalid identifier.');
        }

        const user = results[0];
        console.log(`Found user: ${JSON.stringify(user)}`);

        const checkOtpQuery = 'SELECT * FROM otps WHERE email = ? AND otp = ?';
        db.query(checkOtpQuery, [email, otp], async (err, results) => {
            if (err || results.length === 0) {
                console.error(`Invalid or expired OTP for email: ${email}`);
                return res.status(400).send('Invalid or expired OTP.');
            }

            const otpData = results[0];
            console.log(`Found OTP data: ${JSON.stringify(otpData)}`);

            if (new Date() > new Date(otpData.expires_at)) {
                console.error(`Expired OTP for email: ${email}`);
                return res.status(400).send('Invalid or expired OTP.');
            }

            const token = jwt.sign(
                {
                    email: user.email,
                    userId: user.id
                },
                secretKey,
                { expiresIn: '1h' }
            );

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
