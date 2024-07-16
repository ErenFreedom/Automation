const db = require('../config/db');
const { createNotification } = require('./notificationController');
const socket = require('../socket');

// Controller function to get the latest data from all tables
exports.getLatestData = (req, res) => {
    const tables = ['temp', 'pressure', 'humidity', 'rh'];
    let latestData = {};
    let completedRequests = 0;

    tables.forEach((table) => {
        const query = `SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`;
        db.query(query, (err, results) => {
            if (err) {
                console.error(`Error fetching latest data from MySQL table ${table}:`, err);
                return res.status(500).json({ error: `Error fetching latest data from ${table}` });
            } else {
                if (results.length > 0) {
                    latestData[table] = {
                        value: results[0].value,
                        timestamp: results[0].timestamp
                    };
                } else {
                    latestData[table] = {
                        value: null,
                        timestamp: null
                    };
                }
                completedRequests++;
                if (completedRequests === tables.length) {
                    console.log('Sending latest data:', latestData);
                    res.status(200).json(latestData);
                }

                // Emit the new data through socket.io
                const io = socket.getIo();
                io.emit('data_update', { table, data: latestData[table] });

                // Create a notification for new data insertion
                const userId = req.user.id; // Assuming you have user ID from the request
                const message = `New data added to ${table} table.`;
                createNotification(userId, 'data_update', message);
            }
        });
    });
};
