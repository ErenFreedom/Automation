const db = require('../config/db');

// Controller function to handle data insertion into fetched_data table
exports.insertData = (req, res) => {
    const data = req.body;
    console.log('Inserting data into fetched_data:', data); // Debugging statement
    const query = 'INSERT INTO fetched_data (type, value, quality, qualityGood, timestamp, originalObjectOrPropertyId, objectId, propertyName, attributeId, errorCode, isArray) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
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
        data.isArray
    ];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting data into MySQL fetched_data:', err);
            res.status(500).send('Error inserting data');
        } else {
            console.log('Data inserted successfully into MySQL fetched_data:', results.insertId);
            res.status(200).send('Data inserted successfully');
        }
    });
};

// Helper function to insert data into a specific table
const insertDataIntoTable = (table, data, res) => {
    const query = `INSERT INTO ${table} (type, value, quality, qualityGood, timestamp, originalObjectOrPropertyId, objectId, propertyName, attributeId, errorCode, isArray) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
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
        data.isArray
    ];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error(`Error inserting data into MySQL table ${table}:`, err);
            res.status(500).send(`Error inserting data into ${table}`);
        } else {
            console.log(`Data inserted successfully into MySQL table ${table}:`, results.insertId);
            res.status(200).send(`Data inserted successfully into ${table}`);
        }
    });
};

// Controller function to handle data insertion into temp table
exports.insertTempData = (req, res) => {
    const data = req.body;
    console.log('Inserting data into temp:', data); // Debugging statement
    insertDataIntoTable('temp', data, res);
};

// Controller function to handle data insertion into pressure table
exports.insertPressureData = (req, res) => {
    const data = req.body;
    console.log('Inserting data into pressure:', data); // Debugging statement
    insertDataIntoTable('pressure', data, res);
};

// Controller function to handle data insertion into humidity table
exports.insertHumidityData = (req, res) => {
    const data = req.body;
    console.log('Inserting data into humidity:', data); // Debugging statement
    insertDataIntoTable('humidity', data, res);
};

// Controller function to handle data insertion into rh table
exports.insertRhData = (req, res) => {
    const data = req.body;
    console.log('Inserting data into rh:', data); // Debugging statement
    insertDataIntoTable('rh', data, res);
};
