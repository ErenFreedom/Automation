const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');
const db = require('../config/db');
require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const sns = new AWS.SNS();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.raiseQuery = async (req, res) => {
    const { clientId, department, subject, message, image } = req.body;

    // Insert query into database
    const insertQuery = 'INSERT INTO queries (client_id, department, subject, message, image, status) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [clientId, department, subject, message, image, 'Received'], async (err, results) => {
        if (err) {
            console.error('Error inserting query:', err);
            return res.status(500).send('Error raising query');
        }

        // Send email to department
        const departmentEmails = {
            'temperature': 'temperatureintelli@googlegroups.com',
            'pressure': 'pressureintelli@googlegroups.com',
            'humidity': 'humidityintelli@googlegroups.com',
            'rh': 'rhintelli@googlegroups.com'
        };

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: departmentEmails[department],
            subject: `New Query: ${subject}`,
            text: message,
            attachments: image ? [{ path: image }] : [],
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
                    Message: `New query in department ${department}: ${subject}`,
                    PhoneNumber: staff.phoneNumber,
                };

                sns.publish(params, (err, data) => {
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
};
