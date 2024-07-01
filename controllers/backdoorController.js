const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');
require('dotenv').config();

exports.generateToken = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log(`Email: ${email}, Password: ${password}`);

    const query = 'SELECT * FROM staff WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (results.length === 0) {
            console.error('No user found with email:', email);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            console.error('Invalid password for user:', email);
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
