const db = require('../config/db');
const { validationResult } = require('express-validator');

// Function to check if the activation key is valid and not expired
async function isActivationKeyValid(activationKey) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM activation_keys 
            WHERE activation_key = ? 
            AND expires_at > NOW()`; // Check if the key is still valid (not expired)
        db.query(query, [activationKey], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length > 0) {
                return resolve(results[0]); // Valid key found
            } else {
                return resolve(null); // Invalid or expired key
            }
        });
    });
}

// Controller to verify the activation key and insert data into a specified table
exports.connectToDatabase = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { activationKey, tableName, data } = req.body; // Expect tableName and data to be provided

    try {
        // Check if the activation key is valid and not expired
        const keyData = await isActivationKeyValid(activationKey);
        if (!keyData) {
            return res.status(401).json({ message: 'Invalid or expired activation key.' });
        }

        // Dynamically construct the INSERT query based on provided data
        const columns = Object.keys(data).join(', ');
        const values = Object.values(data).map(() => '?').join(', ');

        const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;

        // Insert the data into the specified table
        db.query(insertQuery, Object.values(data), (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).send('Error inserting data into the table.');
            }

            res.status(200).json({
                message: `Data inserted into table ${tableName} successfully.`,
                insertId: result.insertId // Return the ID of the inserted row
            });
        });

    } catch (error) {
        console.error('Error in connectToDatabase:', error);
        res.status(500).send('Server error');
    }
};
