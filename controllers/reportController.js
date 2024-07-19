const db = require('../config/db');
const json2csv = require('json2csv').parse;
const excel = require('excel4node');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

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

exports.generateReport = async (req, res) => {
    const { timeOption, startTime, endTime, format } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Token not provided');
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).send('Token verification failed');
        }

        const email = user.email;

        if (!timeOption || !format) {
            return res.status(400).send('Missing required parameters');
        }

        identifyTable(email, (err, table) => {
            if (err) {
                console.error('Error identifying table:', err);
                return res.status(500).send('Error identifying table');
            }

            let query = '';
            let values = [];
            const now = new Date();

            if (timeOption === 'today') {
                const hours = req.body.hours || 24;
                const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
                query = `SELECT * FROM ${table} WHERE timestamp >= ?`;
                values = [startTime];
            } else if (timeOption === 'custom') {
                if (!startTime || !endTime) {
                    return res.status(400).send('Missing startTime or endTime for custom report');
                }
                query = `SELECT * FROM ${table} WHERE timestamp BETWEEN ? AND ?`;
                values = [startTime, endTime];
            } else {
                return res.status(400).send('Invalid time option');
            }

            db.query(query, values, (err, results) => {
                if (err) {
                    console.error('Error fetching data for report:', err);
                    return res.status(500).send('Error fetching data');
                }

                if (results.length === 0) {
                    return res.status(404).send('No data found for the specified range');
                }

                try {
                    if (format === 'csv') {
                        const csv = json2csv(results);
                        res.header('Content-Type', 'text/csv');
                        res.attachment(`${table}-report-${Date.now()}.csv`);
                        res.send(csv);
                    } else if (format === 'excel') {
                        const workbook = new excel.Workbook();
                        const worksheet = workbook.addWorksheet('Report');
                        const keys = Object.keys(results[0]);

                        keys.forEach((key, index) => {
                            worksheet.cell(1, index + 1).string(key);
                        });

                        results.forEach((row, rowIndex) => {
                            keys.forEach((key, colIndex) => {
                                worksheet.cell(rowIndex + 2, colIndex + 1).string(String(row[key]));
                            });
                        });

                        const tempFilePath = `./${table}-report-${Date.now()}.xlsx`;
                        workbook.write(tempFilePath, (err, stats) => {
                            if (err) {
                                console.error('Error generating Excel file:', err);
                                return res.status(500).send('Error generating Excel file');
                            }
                            res.download(tempFilePath, (err) => {
                                if (err) {
                                    console.error('Error sending Excel file:', err);
                                }
                                fs.unlinkSync(tempFilePath);
                            });
                        });
                    } else if (format === 'pdf') {
                        const doc = new PDFDocument();
                        const tempFilePath = `./${table}-report-${Date.now()}.pdf`;
                        doc.pipe(fs.createWriteStream(tempFilePath));

                        doc.fontSize(12).text(`Report for ${table}`, {
                            align: 'center',
                        });

                        results.forEach((row, rowIndex) => {
                            doc.text(`\nRow ${rowIndex + 1}`);
                            Object.keys(row).forEach((key) => {
                                doc.text(`${key}: ${row[key]}`);
                            });
                        });

                        doc.end();
                        doc.on('finish', () => {
                            res.download(tempFilePath, (err) => {
                                if (err) {
                                    console.error('Error sending PDF file:', err);
                                }
                                fs.unlinkSync(tempFilePath);
                            });
                        });
                    } else {
                        res.status(400).send('Invalid format');
                    }
                } catch (err) {
                    console.error('Error generating report:', err);
                    res.status(500).send('Error generating report');
                }
            });
        });
    });
};
