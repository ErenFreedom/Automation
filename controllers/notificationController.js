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

let lastCheckedTimestamps = {};  // To track the last checked timestamp for each table

exports.checkThresholds = async () => {
    const thresholdQuery = `SELECT t.user_email, t.sensor_api, t.threshold_value FROM thresholds t`;

    db.query(thresholdQuery, (err, thresholds) => {
        if (err) {
            console.error('Error fetching thresholds:', err);
            return;
        }

        console.log('Fetched Thresholds:', thresholds);

        thresholds.forEach(threshold => {
            identifyTable(threshold.user_email, (err, table) => {
                if (err) {
                    console.error('Error identifying table:', err);
                    return;
                }

                let lastCheckedTimestamp = lastCheckedTimestamps[table] || new Date(0);  // Start from the earliest date if not checked before
                const dataQuery = `SELECT sensor_api, value, timestamp
                                   FROM ${table}
                                   WHERE sensor_api = ? AND value > ? AND timestamp > ?`;
                const values = [threshold.sensor_api, threshold.threshold_value, lastCheckedTimestamp];

                db.query(dataQuery, values, (err, results) => {
                    if (err) {
                        console.error(`Error checking sensor data for ${threshold.sensor_api}:`, err);
                        return;
                    }

                    console.log(`Results for ${threshold.sensor_api} in ${table}:`, results);

                    results.forEach(result => {
                        const alert = {
                            sensorApi: result.sensor_api,
                            value: result.value,
                            timestamp: result.timestamp,
                            message: `Threshold exceeded for ${result.sensor_api}`
                        };

                        // Store the alert in some in-memory store or logging mechanism
                        console.log('Alert:', alert);
                    });

                    if (results.length > 0) {
                        lastCheckedTimestamps[table] = results[results.length - 1].timestamp;
                    }
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

            const query = `SELECT sensor_api, value, timestamp
                           FROM ${table}
                           WHERE value > (SELECT threshold_value FROM thresholds WHERE user_email = ? AND sensor_api = ${table}.sensor_api)`;
            db.query(query, [email], (err, results) => {
                if (err) {
                    console.error('Error fetching notifications:', err);
                    return res.status(500).send('Error fetching notifications');
                }

                console.log('Fetched Notifications:', results);

                res.status(200).json(results);
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
