// // config/timescaledb.js
// const { Client } = require('pg');
// require('dotenv').config();

// const client = new Client({
//     connectionString: process.env.TIMESCALEDB_CONNECTION_STRING,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });

// client.connect()
//     .then(() => console.log('Connected to TimescaleDB'))
//     .catch(err => console.error('Connection error', err.stack));

// module.exports = client;
