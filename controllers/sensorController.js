const db = require('../config/db');

// Fetch all sensors for the authenticated user (client or staff)
exports.getAllSensors = async (req, res) => {
    const { userId } = req.user;

    try {
        const sensorsQuery = `
            SELECT id, sensor_type, api_endpoint
            FROM sensors
            WHERE client_id = ? OR staff_id = ?
        `;
        const result = await db.query(sensorsQuery, [userId, userId]);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching sensors:', err);
        res.status(500).send('Error fetching sensors.');
    }
};

// Fetch sensor data for a specific sensor
exports.getSensorData = async (req, res) => {
    const { userId } = req.user;
    const { sensorId } = req.params;

    try {
        // Verify the sensor belongs to the user
        const verifySensorQuery = `
            SELECT 1
            FROM sensors
            WHERE id = ? AND (client_id = ? OR staff_id = ?)
        `;
        const verifyResult = await db.query(verifySensorQuery, [sensorId, userId, userId]);
        if (verifyResult.length === 0) {
            return res.status(404).send('Sensor not found.');
        }

        const sensorDataQuery = `
            SELECT *
            FROM sensor_data
            WHERE sensor_id = ?
            ORDER BY timestamp DESC
            LIMIT 100
        `;
        const result = await db.query(sensorDataQuery, [sensorId]);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching sensor data:', err);
        res.status(500).send('Error fetching sensor data.');
    }
};
