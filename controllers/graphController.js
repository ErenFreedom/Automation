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

// Fetch unique APIs from the sensor data table
const fetchUniqueAPIs = (table, callback) => {
    const query = `SELECT DISTINCT sensor_api FROM ${table}`;

    db.query(query, (err, results) => {
        if (err) {
            console.error(`Error fetching unique APIs from table ${table}:`, err);
            return callback(err);
        }

        const apis = results.map(row => row.sensor_api);
        callback(null, apis);
    });
};

// Fetch all data for a specific API
const fetchAllDataForAPI = (table, api, callback) => {
    const query = `SELECT sensor_api, type, value, quality, qualityGood, timestamp FROM ${table} WHERE sensor_api = ? ORDER BY timestamp ASC`;

    db.query(query, [api], (err, results) => {
        if (err) {
            console.error(`Error fetching data for API ${api} from table ${table}:`, err);
            return callback(err);
        }

        callback(null, results);
    });
};

const filterDataByTimeWindow = (data, timeWindow) => {
    if (data.length === 0) return [];

    const endTime = new Date();
    let startTime;

    switch (timeWindow) {
        case '1day':
            startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '1week':
            startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '1month':
            startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            return data;
    }

    return data.filter(item => new Date(item.timestamp) >= startTime && new Date(item.timestamp) <= endTime);
};

const getFilteredDataForAPI = (table, api, timeWindow, callback) => {
    fetchAllDataForAPI(table, api, (err, data) => {
        if (err) return callback(err);

        const filteredData = filterDataByTimeWindow(data, timeWindow);

        const values = filteredData.map(item => item.value);
        if (values.length === 0) {
            return callback(null, {
                api,
                data: [],
                metrics: {
                    average: 'NaN',
                    max: '-Infinity',
                    min: 'Infinity',
                    range: '-Infinity',
                    variance: 'NaN',
                    stddev: 'NaN'
                }
            });
        }

        const sum = values.reduce((a, b) => a + b, 0);
        const average = (sum / values.length).toFixed(2);
        const max = Math.max(...values).toFixed(2);
        const min = Math.min(...values).toFixed(2);
        const range = (max - min).toFixed(2);
        const variance = (values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / values.length).toFixed(2);
        const stddev = Math.sqrt(variance).toFixed(2);

        const metrics = {
            average,
            max,
            min,
            range,
            variance,
            stddev
        };

        callback(null, { api, data: filteredData, metrics });
    });
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

            fetchUniqueAPIs(table, (err, apis) => {
                if (err) return res.status(500).send('Error fetching unique APIs');

                const apiDataPromises = apis.map(api => {
                    return new Promise((resolve, reject) => {
                        getFilteredDataForAPI(table, api, timeWindow, (err, data) => {
                            if (err) return reject(err);
                            resolve(data);
                        });
                    });
                });

                Promise.all(apiDataPromises)
                    .then(data => {
                        const sortedData = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                        res.json(sortedData);
                    })
                    .catch(err => {
                        console.error('Error fetching data for APIs:', err);
                        res.status(500).send('Error fetching data for APIs');
                    });
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
