const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { exec } = require('child_process');

const router = express.Router();
const secretKey = process.env.SECRET_KEY;

// Middleware to check JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token.split(' ')[1], secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// Start logging data
router.post('/logger/start', authenticateToken, (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    exec(`node dataLogger/dataLoggerScript.js ${token}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error starting logger: ${err.message}`);
            return res.status(500).send('Error starting logger.');
        }
        res.send('Started logging data.');
    });
});

// Stop logging data (if needed)
router.post('/logger/stop', authenticateToken, (req, res) => {
    // Implement a way to stop the data logger script if running in the background
    res.send('Stopped logging data.');
});

module.exports = router;
