const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { decryptData } = require('../utils/otpGeneration'); // Make sure this is the correct path to your decryption utility
require('dotenv').config();

exports.generateToken = (req, res) => {
    const { email, password } = req.body; 

    // Log received email and password
    console.log(`Received email: ${email}, password: ${password}`);

    const query = 'SELECT * FROM staff WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (results.length === 0) {
            console.log('No user found with the provided email');
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const user = results[0];
        console.log('User found:', user);

        // Decrypt the password
        const decryptedPassword = decryptData(password);

        const validPassword = await bcrypt.compare(decryptedPassword, user.password);
        console.log('Password valid:', validPassword);

        if (!validPassword) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = jwt.sign(
            { 
                email: user.email, 
                userId: user.id, 
                department: user.department 
            }, 
            process.env.SECRET_KEY, 
            { expiresIn: '1h' }
        );

        res.json({ access_token: token });
    });
};
