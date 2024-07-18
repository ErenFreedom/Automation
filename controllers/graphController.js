const db = require('../config/db');
const jwt = require('jsonwebtoken');
const moment = require('moment');
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
    const query = `SELECT sensor_api, type, value, quality, qualityGood, timestamp FROM ${table} ORDER BY id ASC`;

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
    if (data.length === 0) return [];

    const endTime = moment();
    let startTime;

    switch (timeWindow) {
        case '1day':
            startTime = endTime.clone().subtract(1, 'days');
            break;
        case '1week':
            startTime = endTime.clone().subtract(1, 'weeks');
            break;
        case '1month':
            startTime = endTime.clone().subtract(1, 'months');
            break;
        default:
            return data;
    }

    console.log(`Filtering data from ${startTime.toISOString()} to ${endTime.toISOString()}`);
    return data.filter(item => {
        const itemTime = moment(item.timestamp);
        const isWithinTimeWindow = itemTime.isBetween(startTime, endTime);
        if (!isWithinTimeWindow) {
            console.log(`Excluding data point with timestamp: ${item.timestamp}`);
        }
        return isWithinTimeWindow;
    });
};

const calculateMetrics = (data) => {
    const values = data.map(item => item.value);
    if (values.length === 0) {
        return {
            average: 'NaN',
            max: '-Infinity',
            min: 'Infinity',
            range: '-Infinity',
            variance: 'NaN',
            stddev: 'NaN'
        };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const average = (sum / values.length).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    const range = (max - min).toFixed(2);
    const variance = (values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / values.length).toFixed(2);
    const stddev = Math.sqrt(variance).toFixed(2);

    return {
        average,
        max,
        min,
        range,
        variance,
        stddev
    };
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

                const apiData = Object.keys(groupedData).map(api => {
                    const filteredData = filterDataByTimeWindow(groupedData[api], timeWindow);
                    const metrics = calculateMetrics(filteredData);
                    return { api, data: filteredData.map(item => ({ value: item.value, timestamp: item.timestamp })), metrics };
                });

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
