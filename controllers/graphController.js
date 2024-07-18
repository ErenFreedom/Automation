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

// Fetch all data from the sensor data table
const fetchAllData = (table, callback) => {
    const query = `SELECT sensor_api, value, timestamp FROM ${table} ORDER BY id ASC`;

    db.query(query, (err, results) => {
        if (err) {
            console.error(`Error fetching data from table ${table}:`, err);
            return callback(err);
        }

        console.log(`Fetched ${results.length} rows from ${table}`);
        callback(null, results);
    });
};

const filterDataByTimeWindow = (data, timeWindow) => {
    const now = new Date();
    let startTime;

    switch (timeWindow) {
        case '1day':
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '1week':
            startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '1month':
            startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startTime = new Date(0); // Default to all data if no time window is specified
    }

    return data.filter(item => new Date(item.timestamp) >= startTime && new Date(item.timestamp) <= now);
};

const getDataForAllAPIs = (req, res, timeWindow) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { email } = decoded;

        identifyTable(email, (err, table) => {
            if (err) {
                console.error('Error identifying table:', err);
                return res.status(500).send('Error identifying table');
            }

            fetchAllData(table, (err, data) => {
                if (err) return res.status(500).send('Error fetching data');

                if (data.length === 0) {
                    console.log('No data fetched from the table');
                    return res.json([]);
                }

                const groupedData = data.reduce((acc, item) => {
                    if (!acc[item.sensor_api]) {
                        acc[item.sensor_api] = [];
                    }
                    acc[item.sensor_api].push(item);
                    return acc;
                }, {});

                const apiData = Object.keys(groupedData).map(api => ({
                    api,
                    data: filterDataByTimeWindow(groupedData[api], timeWindow),
                }));

                console.log(`Sending data for ${apiData.length} APIs`);
                res.json(apiData);
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

exports.getDataForAllAPIs1Day = (req, res) => getDataForAllAPIs(req, res, '1day');
exports.getDataForAllAPIs1Week = (req, res) => getDataForAllAPIs(req, res, '1week');
exports.getDataForAllAPIs1Month = (req, res) => getDataForAllAPIs(req, res, '1month');
