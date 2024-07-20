const db = require('../config/db');
const json2csv = require('json2csv').parse;
const excel = require('excel4node');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'xC8!vH7zD@iM9wT1&fQ#4sE2kU$3bN6^lR'; // Ensure you have a secret key

const identifyTable = (email, callback) => {
    db.query('SELECT id FROM clients WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error querying clients table:', err);
            return callback(err);
        }
        if (results.length > 0) {
            const userId = results[0].id;
            return callback(null, `client_sensor_data_${userId}`);
        }

        callback(new Error('Email not found in clients table'));
    });
};

exports.generateReport = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { email } = decoded;

        identifyTable(email, (err, table) => {
            if (err) {
                console.error('Error identifying table:', err);
                return res.status(500).send('Error identifying table');
            }

            const { timeOption, hours, startTime, endTime, format } = req.body;

            if (!timeOption || !format || (timeOption === 'custom' && (!startTime || !endTime))) {
                return res.status(400).send('Missing required parameters');
            }

            let query = `SELECT id, sensor_api, value, timestamp, quality FROM ${table} WHERE timestamp BETWEEN ? AND ?`;
            let values = [];

            if (timeOption === 'today') {
                const now = new Date();
                const startOfDay = new Date(now.setHours(0, 0, 0, 0));
                const endOfDay = new Date(now.setHours(23, 59, 59, 999));
                if (hours && hours > 0 && hours < 24) {
                    const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
                    values = [startTime, endOfDay];
                } else {
                    values = [startOfDay, endOfDay];
                }
            } else if (timeOption === 'custom') {
                values = [startTime, endTime];
            }

            db.query(query, values, (err, results) => {
                if (err) {
                    console.error('Error fetching data for report:', err);
                    return res.status(500).send('Error fetching data');
                }

                if (results.length === 0) {
                    return res.status(404).send('No data found for the specified range');
                }

                if (format === 'csv') {
                    try {
                        const csv = json2csv(results);
                        res.header('Content-Type', 'text/csv');
                        res.attachment(`${table}-report-${Date.now()}.csv`);
                        res.send(csv);
                    } catch (err) {
                        console.error('Error generating CSV:', err);
                        res.status(500).send('Error generating CSV');
                    }
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
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
