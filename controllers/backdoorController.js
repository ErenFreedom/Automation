const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');
require('dotenv').config();

exports.generateToken = (req, res) => {
    const { email, password } = req.body; 

    const query = 'SELECT * FROM staff WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

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
