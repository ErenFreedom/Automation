const db = require('../config/db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Generate a random 12-16 digit activation key
function generateActivationKey() {
    return Math.random().toString(36).substring(2, 18);  // Generates a random 16-character string
}

// Send activation key via email using Nodemailer
async function sendActivationKeyEmail(email, activationKey) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Activation Key for Cloud Access',
        text: `Your activation key is: ${activationKey}. Please use this key to connect to the cloud.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Activation key sent to ${email}`);
    } catch (error) {
        console.error(`Error sending activation key to ${email}:`, error);
        throw new Error('Error sending activation key');
    }
}

// Login for Cloud Connection (clients/staff)
exports.cloudLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body; // Identifier can be email or username
    const decryptedPassword = password;  // Assuming password is already decrypted by frontend

    // Query for both staff and clients
    const query = `
        SELECT *, 'staff' AS user_type FROM staff WHERE email = ? OR username = ? 
        UNION 
        SELECT *, 'client' AS user_type FROM clients WHERE email = ? OR username = ?;
    `;
    db.query(query, [identifier, identifier, identifier, identifier], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(decryptedPassword, user.password);

        if (!validPassword) {
            return res.status(401).send('Invalid credentials');
        }

        // Generate activation key
        const activationKey = generateActivationKey();

        // Insert the activation key into the activation_keys table
        const insertActivationKeyQuery = 'INSERT INTO activation_keys (user_id, user_type, activation_key) VALUES (?, ?, ?)';
        db.query(insertActivationKeyQuery, [user.id, user.user_type, activationKey], async (err) => {
            if (err) {
                console.error('Error storing activation key:', err);
                return res.status(500).send('Error storing activation key');
            }

            // Send activation key via email
            try {
                await sendActivationKeyEmail(user.email, activationKey);
                res.status(200).json({ message: 'Activation key sent to your email.', email: user.email });
            } catch (error) {
                res.status(500).send('Error sending activation key.');
            }
        });
    });
};
