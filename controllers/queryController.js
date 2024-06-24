const { parsePhoneNumberFromString } = require('libphonenumber-js');
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

const formatPhoneNumber = (phoneNumber) => {
    const phoneNumberObj = parsePhoneNumberFromString(phoneNumber);
    if (phoneNumberObj && phoneNumberObj.isValid()) {
        return phoneNumberObj.format('E.164');
    }
    return null;
};

exports.raiseQuery = async (req, res) => {
    const { clientEmail, department, subject, message, imageUrl } = req.body;

    // Insert query into database
    const insertQuery = 'INSERT INTO queries (clientEmail, department, subject, message, imageUrl, status) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [clientEmail, department, subject, message, imageUrl, 'Received'], async (err, results) => {
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

            console.log('Staff phone numbers:', staffResults); // Log the phone numbers

            staffResults.forEach(staff => {
                const formattedPhoneNumber = formatPhoneNumber(staff.phoneNumber);
                if (formattedPhoneNumber) {
                    const params = {
                        Message: `New query in department ${department}: ${subject}`,
                        PhoneNumber: formattedPhoneNumber,
                    };

                    sns.publish(params, (err, data) => {
                        if (err) {
                            console.error('Error sending SMS:', err);
                        } else {
                            console.log('SMS sent:', data);
                        }
                    });
                } else {
                    console.error('Invalid phone number:', staff.phoneNumber);
                }
            });

            res.status(200).send('Query raised successfully');
        });
    });
};
