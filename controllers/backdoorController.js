const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');
require('dotenv').config();

exports.generateToken = (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
    }

    console.log(`Identifier: ${identifier}, Password: ${password}`);

    // Check if the identifier is an email or username
    const query = identifier.includes('@') 
        ? 'SELECT * FROM users WHERE email = ?'
        : 'SELECT * FROM users WHERE username = ?';

    db.query(query, [identifier], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (results.length === 0) {
            console.error('No user found with identifier:', identifier);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            console.error('Invalid password for user:', identifier);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = jwt.sign({ user: identifier }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.json({ access_token: token });
    });
};
