const db = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY; // Load secret key from .env

// Fetch Last Sensor Data for Each API
exports.fetchLastSensorDataForEachAPI = async (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authorizationHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { userId, email } = decoded;

        const checkClientQuery = 'SELECT * FROM clients WHERE email = ?';

        db.query(checkClientQuery, [email], (err, clientResults) => {
            if (err) {
                console.error('Error querying clients table:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (clientResults.length > 0) {
                // User is in the clients table
                const schemaName = `client_sensor_data_${userId}`;
                fetchLatestDataForAllAPIs(schemaName, res);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

const fetchLatestDataForAllAPIs = (schemaName, res) => {
    const fetchLatestDataQuery = `
        SELECT * FROM ${schemaName} AS s1
        WHERE s1.id = (
            SELECT MAX(s2.id)
            FROM ${schemaName} AS s2
            WHERE s2.sensor_api = s1.sensor_api
        )
    `;

    db.query(fetchLatestDataQuery, (err, results) => {
        if (err) {
            console.error('Error fetching sensor data:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        res.status(200).json(results);
    });
};

// Stream Sensor Data using SSE
exports.streamSensorData = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { userId, email } = decoded;

        const checkClientQuery = 'SELECT * FROM clients WHERE email = ?';

        db.query(checkClientQuery, [email], (err, clientResults) => {
            if (err) {
                console.error('Error querying clients table:', err);
                res.write(`data: ${JSON.stringify({ error: 'Error fetching data' })}\n\n`);
                return;
            }

            if (clientResults.length > 0) {
                const schemaName = `client_sensor_data_${userId}`;
                streamDataForSchema(req, schemaName, res);  // Pass req here
            } else {
                res.write(`data: ${JSON.stringify({ error: 'User not found' })}\n\n`);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Unauthorized' })}\n\n`);
    }
};

const streamDataForSchema = (req, schemaName, res) => {  // Accept req as a parameter
    const fetchLatestDataQuery = `
        SELECT * FROM ${schemaName} AS s1
        WHERE s1.id = (
            SELECT MAX(s2.id)
            FROM ${schemaName} AS s2
            WHERE s2.sensor_api = s1.sensor_api
        )
    `;

    const sendData = () => {
        db.query(fetchLatestDataQuery, (err, results) => {
            if (err) {
                console.error('Error fetching sensor data:', err);
                res.write(`data: ${JSON.stringify({ error: 'Error fetching data' })}\n\n`);
            } else {
                res.write(`data: ${JSON.stringify(results)}\n\n`);
            }
        });
    };

    // Send data every 5 seconds
    const interval = setInterval(sendData, 5000);

    // Cleanup when client disconnects
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
};
