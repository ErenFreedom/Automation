// controllers/monitorController.js
const db = require('../config/db');

const THRESHOLDS = {
    temp: 35,       // Temperature threshold
    pressure: 1015, // Pressure threshold in hPa
    humidity: 70,   // Humidity threshold in percentage
    rh: 60          // Relative Humidity threshold in percentage
};

exports.checkThresholds = (req, res) => {
    const tables = ['temp', 'pressure', 'humidity', 'rh'];
    const alerts = [];

    tables.forEach((table, index) => {
        const query = `SELECT * FROM ${table} WHERE value > ?`;
        db.query(query, [THRESHOLDS[table]], (err, results) => {
            if (err) {
                console.error(`Error fetching data from ${table}:`, err);
                return res.status(500).json({ error: `Error fetching data from ${table}` });
            } else {
                results.forEach((row) => {
                    alerts.push({
                        table,
                        value: row.value,
                        timestamp: row.timestamp,
                    });
                });
            }

            if (index === tables.length - 1) {
                res.status(200).json(alerts);
            }
        });
    });
};
