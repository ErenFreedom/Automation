const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const { decryptData } = require('../utils/otpGeneration');
const SECRET_KEY = 'your_secret_key'; // Ensure you have a secret key

// Check Account
exports.checkAccount = async (req, res) => {
    const { role, email, password, apis } = req.body;
    console.log(`Checking account for email: ${email}, role: ${role}`);

    try {
        const decryptedPassword = decryptData(password);

        const table = role === 'client' ? 'clients' : 'staff';
        const roleType = role === 'client' ? 'client' : 'staff';

        db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, rows) => {
            if (err) {
                console.error(`Error querying ${table} table:`, err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (rows.length > 0) {
                const user = rows[0];
                const isMatch = await bcrypt.compare(decryptedPassword, user.password);
                if (isMatch) {
                    // Save the sensors for the user
                    if (apis && apis.length > 0) {
                        for (const api of apis) {
                            db.query('INSERT INTO user_sensors (user_id, user_email, sensor_api, role_type) VALUES (?, ?, ?, ?)', [user.id, email, api, roleType], (err) => {
                                if (err) {
                                    console.error('Error inserting sensors:', err);
                                }
                            });
                        }
                    }

                    // Create user-specific sensor data table
                    const schemaName = await createUserSensorTable(user.id, roleType);

                    // Generate token
                    const token = jwt.sign({ id: user.id, email: user.email, role: roleType }, SECRET_KEY, { expiresIn: '1h' });

                    // Save config data to JSON file
                    const configData = { role: roleType, email, password, schemaName };
                    await fs.writeFile('cloudServerConfig.json', JSON.stringify(configData, null, 2));

                    return res.status(200).json({ message: 'Connection successful', user, token, schemaName });
                } else {
                    console.log('Invalid Credentials: Password mismatch');
                    return res.status(401).json({ message: 'Invalid Credentials' });
                }
            } else {
                console.log('Invalid Credentials: Email not found');
                return res.status(401).json({ message: 'Invalid Credentials' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Create User-Specific Sensor Data Table
const createUserSensorTable = (userId, roleType) => {
    return new Promise((resolve, reject) => {
        const schemaName = `${roleType}_sensor_data_${userId}`;
        db.query('CALL create_user_sensor_table(?, ?)', [userId, roleType], (err, results) => {
            if (err) {
                console.error('Error creating user sensor table:', err);
                return reject(err);
            }
            resolve(schemaName);
        });
    });
};

// Add Sensor Data
exports.addSensorData = async (req, res) => {
    const { email, roleType, sensorData, schemaName } = req.body;

    try {
        // Prepare the insert query
        const insertDataQuery = `
            INSERT INTO ${schemaName} 
            (sensor_api, type, value, quality, qualityGood, timestamp, originalObjectOrPropertyId, objectId, propertyName, attributeId, errorCode, isArray, sent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Loop through sensorData array to insert each data point
        for (const data of sensorData) {
            const values = [
                data.sensor_api,
                data.type, 
                data.value, 
                data.quality, 
                data.qualityGood, 
                data.timestamp, 
                data.originalObjectOrPropertyId, 
                data.objectId, 
                data.propertyName, 
                data.attributeId, 
                data.errorCode, 
                data.isArray, 
                data.sent
            ];

            await db.query(insertDataQuery, values, (err, results) => {
                if (err) {
                    console.error('Error inserting sensor data:', err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
            });
        }

        res.status(201).json({ message: 'Sensor data added successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
