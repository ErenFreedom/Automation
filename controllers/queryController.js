const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const pinpoint = new AWS.Pinpoint({ apiVersion: '2016-12-01' });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid filename conflicts
    }
});

const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single('image'); // Middleware to handle single file upload

exports.raiseQuery = async (req, res) => {
    const { clientEmail, department, subject, message } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    // Insert query into database
    const insertQuery = 'INSERT INTO queries (clientEmail, department, subject, message, imageUrl) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [clientEmail, department, subject, message, imageUrl], async (err, results) => {
        if (err) {
            console.error('Error inserting query:', err);
            return res.status(500).send('Error raising query');
        }

        const queryId = results.insertId;

        // Insert initial status into query_status table
        const insertStatusQuery = 'INSERT INTO query_status (query_id, status) VALUES (?, ?)';
        db.query(insertStatusQuery, [queryId, 'Received'], (err) => {
            if (err) {
                console.error('Error inserting query status:', err);
                return res.status(500).send('Error raising query');
            }
        });

        // Fetch email addresses of department staff
        const getEmailsQuery = 'SELECT email FROM staff WHERE department = ?';
        db.query(getEmailsQuery, [department], (err, staffResults) => {
            if (err) {
                console.error('Error fetching staff emails:', err);
                return res.status(500).send('Error fetching staff emails');
            }

            const emailAddresses = staffResults.map(staff => staff.email);
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: emailAddresses, // Send to all fetched email addresses
                subject: `New Query: ${subject}`,
                text: message,
                attachments: imageUrl ? [{ path: imageUrl }] : [],
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err);
                    return res.status(500).send('Error sending email');
                }

                console.log('Email sent:', info.response);
            });

            // Send SMS to department staff
            const getStaffQuery = 'SELECT phoneNumber FROM staff WHERE department = ?';
            db.query(getStaffQuery, [department], (err, staffResults) => {
                if (err) {
                    console.error('Error fetching staff phone numbers:', err);
                    return res.status(500).send('Error fetching staff phone numbers');
                }

                staffResults.forEach(staff => {
                    const params = {
                        ApplicationId: process.env.PINPOINT_APPLICATION_ID,
                        MessageRequest: {
                            Addresses: {
                                [staff.phoneNumber]: {
                                    ChannelType: 'SMS'
                                }
                            },
                            MessageConfiguration: {
                                SMSMessage: {
                                    Body: `New query in department ${department}: ${subject}`,
                                    MessageType: 'TRANSACTIONAL'
                                }
                            }
                        }
                    };

                    pinpoint.sendMessages(params, (err, data) => {
                        if (err) {
                            console.error('Error sending SMS:', err);
                        } else {
                            console.log('SMS sent:', data);
                        }
                    });
                });

                res.status(200).send('Query raised successfully');
            });
        });
    });
};
