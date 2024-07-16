const db = require('../config/db');
const json2csv = require('json2csv').parse;
const excel = require('excel4node');
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generateReport = async (req, res) => {
    const { table, startTime, endTime, format } = req.body;

    if (!table || !startTime || !endTime || !format) {
        return res.status(400).send('Missing required parameters');
    }

    const query = `SELECT * FROM ${table} WHERE timestamp BETWEEN ? AND ?`;
    const values = [startTime, endTime];

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
};
