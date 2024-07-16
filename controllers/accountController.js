const db = require('../config/db');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
require('dotenv').config();
const { createNotification } = require('./notificationController');

// Edit Account
exports.editAccount = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, username } = req.body;
    const userId = req.user.id;

    const updateQuery = 'UPDATE users SET email = ?, username = ? WHERE id = ?';
    db.query(updateQuery, [email, username, userId], (err, results) => {
        if (err) {
            console.error('Error updating account:', err);
            return res.status(500).send('Error updating account');
        }

        // Create a notification
        const message = 'Your account details have been updated.';
        createNotification(userId, 'account_update', message);

        res.status(200).send('Account updated successfully');
    });
};

// Change Password
exports.changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }
        const user = results[0];
        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) {
            return res.status(401).send('Invalid old password');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
        db.query(updateQuery, [hashedNewPassword, userId], (err) => {
            if (err) {
                console.error('Error changing password:', err);
                return res.status(500).send('Error changing password');
            }

            // Create a notification
            const message = 'Your password has been changed.';
            createNotification(userId, 'password_change', message);

            res.status(200).send('Password changed successfully');
        });
    });
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    const userId = req.user.id;

    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteQuery, [userId], (err) => {
        if (err) {
            console.error('Error deleting account:', err);
            return res.status(500).send('Error deleting account');
        }

        // Create a notification
        const message = 'Your account has been deleted.';
        createNotification(userId, 'account_deletion', message);

        res.status(200).send('Account deleted successfully');
    });
};
