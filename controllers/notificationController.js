const db = require('../config/db');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'xC8!vH7zD@iM9wT1&fQ#4sE2kU$3bN6^lR'; // Ensure you have a secret key

const identifyTable = (email, callback) => {
    db.query('SELECT id FROM staff WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error querying staff table:', err);
            return callback(err);
        }
        if (results.length > 0) {
            const userId = results[0].id;
            return callback(null, `staff_sensor_data_${userId}`);
        }

        db.query('SELECT id FROM clients WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Error querying clients table:', err);
                return callback(err);
            }
            if (results.length > 0) {
                const userId = results[0].id;
                return callback(null, `client_sensor_data_${userId}`);
            }

            callback(new Error('Email not found in staff or clients table'));
        });
    });
};

exports.checkThresholds = async () => {
    const thresholdQuery = `SELECT t.table_name, t.sensor_api, t.threshold_value
                            FROM thresholds t`;

    db.query(thresholdQuery, (err, thresholds) => {
        if (err) {
            console.error('Error fetching thresholds:', err);
            return;
        }

        thresholds.forEach(threshold => {
            const dataQuery = `SELECT sensor_api, value, timestamp
                               FROM ${threshold.table_name}
                               WHERE sensor_api = ? AND value > ?`;
            const values = [threshold.sensor_api, threshold.threshold_value];

            db.query(dataQuery, values, (err, results) => {
                if (err) {
                    console.error(`Error checking sensor data for ${threshold.sensor_api}:`, err);
                    return;
                }

                results.forEach(result => {
                    const notificationQuery = `INSERT INTO notifications (table_name, sensor_api, value, timestamp, message)
                                               VALUES (?, ?, ?, ?, ?)`;
                    const notificationValues = [threshold.table_name, result.sensor_api, result.value, result.timestamp, `Threshold exceeded for ${result.sensor_api}`];

                    db.query(notificationQuery, notificationValues, (err) => {
                        if (err) {
                            console.error('Error inserting notification:', err);
                        }
                    });
                });
            });
        });
    });
};

exports.getNotifications = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { email } = decoded;

        identifyTable(email, (err, table) => {
            if (err) {
                console.error('Error identifying table:', err);
                return res.status(500).send('Error identifying table');
            }

            const query = `SELECT * FROM notifications WHERE table_name = ? ORDER BY timestamp DESC`;
            db.query(query, [table], (err, results) => {
                if (err) {
                    console.error('Error fetching notifications:', err);
                    return res.status(500).send('Error fetching notifications');
                }

                res.status(200).json(results);
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
