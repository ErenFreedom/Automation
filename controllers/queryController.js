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
    const { clientEmail, department, subject, message, imageUrl } = req.body;

    try {
        // Insert query into database
        const insertQuery = 'INSERT INTO queries (clientEmail, department, subject, message, imageUrl, status) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(insertQuery, [clientEmail, department, subject, message, imageUrl, 'Received']);

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
            attachments: imageUrl ? [{ path: imageUrl }] : [],
        };

        await transporter.sendMail(mailOptions);

        // Send SMS to department staff
        const getStaffQuery = 'SELECT phoneNumber FROM staff WHERE department = ?';
        const [staffResults] = await db.query(getStaffQuery, [department]);

        staffResults.forEach(staff => {
            const params = {
                Message: `New query in department ${department}: ${subject} - ${message}`,
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
    } catch (err) {
        console.error('Error raising query:', err);
        res.status(500).send('Error raising query');
    }
};
