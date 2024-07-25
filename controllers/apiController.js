const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.getUniqueSensorAPIs = async (req, res) => {
    const { token } = req.body;

    try {
        const secretKey = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secretKey);
        const { userId, role } = decoded;
        const tableName = role === 'client' ? `client_sensor_data_${userId}` : `staff_sensor_data_${userId}`;

        db.query(`SELECT DISTINCT sensor_api FROM ${tableName}`, (err, rows) => {
            if (err) {
                console.error('Error querying sensor data table:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            const uniqueAPIs = rows.map(row => row.sensor_api);
            res.status(200).json({ uniqueAPIs });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

exports.mapSensorAPIsToTags = async (req, res) => {
    const { token, mappings } = req.body;

    try {
        const secretKey = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secretKey);
        const { userId, role } = decoded;
        const tableName = role === 'client' ? `client_sensor_data_${userId}` : `staff_sensor_data_${userId}`;

        // Validate mappings
        if (!Array.isArray(mappings) || mappings.some(mapping => !mapping.api || !mapping.tag)) {
            return res.status(400).json({ message: 'Invalid mappings format' });
        }

        for (const mapping of mappings) {
            db.query(`UPDATE ${tableName} SET sensor_api = ? WHERE sensor_api = ?`, [mapping.tag, mapping.api], (err) => {
                if (err) {
                    console.error('Error updating sensor data table:', err);
                }
            });
        }

        res.status(200).json({ message: 'Mappings updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};
