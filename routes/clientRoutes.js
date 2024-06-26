const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middlewares/authenticateToken'); // Adjust the path as needed

// Route to get client details
router.get('/client-details', authenticateToken, (req, res) => {
    const clientEmail = req.user.email; // Assuming the email is stored in the JWT

    const getClientQuery = 'SELECT * FROM clients WHERE email = ?';
    db.query(getClientQuery, [clientEmail], (err, results) => {
        if (err) {
            console.error('Error fetching client details:', err);
            return res.status(500).send('Error fetching client details');
        }

        if (results.length === 0) {
            return res.status(404).send('Client not found');
        }

        res.status(200).send(results[0]);
    });
});

module.exports = router;
