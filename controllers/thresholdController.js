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

exports.setThresholds = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { email } = decoded;
        const thresholds = req.body.thresholds;

        if (!thresholds || !Array.isArray(thresholds) || thresholds.length === 0) {
            return res.status(400).send('Invalid threshold data');
        }

        identifyTable(email, (err, table) => {
            if (err) {
                console.error('Error identifying table:', err);
                return res.status(500).send('Error identifying table');
            }

            // Fetch unique sensor APIs from the sensor data table
            const sensorApiQuery = `SELECT DISTINCT sensor_api FROM ${table}`;
            db.query(sensorApiQuery, (err, sensorApis) => {
                if (err) {
                    console.error('Error fetching sensor APIs:', err);
                    return res.status(500).send('Error fetching sensor APIs');
                }

                const validThresholds = thresholds.filter(threshold => 
                    sensorApis.some(sensor => sensor.sensor_api === threshold.sensorApi)
                );

                if (validThresholds.length === 0) {
                    return res.status(400).send('No valid sensor APIs found');
                }

                let query = 'INSERT INTO thresholds (user_email, sensor_api, threshold_value) VALUES ';
                const values = [];

                validThresholds.forEach((threshold, index) => {
                    query += '(?, ?, ?)';
                    if (index < validThresholds.length - 1) {
                        query += ', ';
                    }
                    values.push(email, threshold.sensorApi, threshold.thresholdValue);
                });

                query += ' ON DUPLICATE KEY UPDATE threshold_value = VALUES(threshold_value)';

                db.query(query, values, (err, results) => {
                    if (err) {
                        console.error('Error setting thresholds:', err);
                        return res.status(500).send('Error setting thresholds');
                    }
                    res.status(200).send('Thresholds set successfully');
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
