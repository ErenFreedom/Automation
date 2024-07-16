const db = require('../config/db');

// Function to create a notification
const createNotification = (userId, type, message) => {
    const query = 'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)';
    db.query(query, [userId, type, message], (err, results) => {
        if (err) {
            console.error('Error creating notification:', err);
        } else {
            console.log('Notification created successfully');
        }
    });
};

// Function to fetch notifications for a user
exports.getNotifications = (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT * FROM notifications WHERE user_id = ? AND status = "unread"';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).send('Error fetching notifications');
        }
        res.status(200).json(results);
    });
};

// Function to mark notifications as read
exports.markNotificationsAsRead = (req, res) => {
    const userId = req.user.id;
    const query = 'UPDATE notifications SET status = "read" WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error marking notifications as read:', err);
            return res.status(500).send('Error marking notifications as read');
        }
        res.status(200).send('Notifications marked as read');
    });
};

// Export the createNotification function for use in other controllers
exports.createNotification = createNotification;
