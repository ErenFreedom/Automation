const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');
require('dotenv').config();

exports.generateToken = (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or username

    // Check if the identifier is an email or username
    const query = identifier.includes('@') 
        ? 'SELECT * FROM users WHERE email = ?'
        : 'SELECT * FROM users WHERE username = ?';

    db.query(query, [identifier], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = jwt.sign({ user: identifier }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.json({ access_token: token });
    });
};
