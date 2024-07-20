const db = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY; // Load secret key from .env

const identifyClientTable = (email, callback) => {
    db.query('SELECT id FROM clients WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error querying clients table:', err);
            return callback(err);
        }
        if (results.length > 0) {
            const userId = results[0].id;
            return callback(null, `client_sensor_data_${userId}`);
        }
        callback(new Error('Email not found in clients table'));
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

const getDataForAllAPIs = (req, res, timeWindow) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { email } = decoded;

        identifyClientTable(email, (err, table) => {
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

                // Create a new attribute with a friendly timestamp format
                data.forEach(item => {
                    item.friendly_timestamp = new Date(item.timestamp).toLocaleString();
                });

                // Determine the filter start time based on the timeWindow
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

                // Filter data based on the start time
                const filteredData = data.filter(item => new Date(item.timestamp) >= startTime);

                const groupedData = filteredData.reduce((acc, item) => {
                    if (!acc[item.sensor_api]) {
                        acc[item.sensor_api] = [];
                    }
                    acc[item.sensor_api].push(item);
                    return acc;
                }, {});

                const apiData = Object.keys(groupedData).map(api => ({
                    api,
                    data: groupedData[api],
                }));

                console.log(`Sending filtered data for ${apiData.length} APIs`);
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
