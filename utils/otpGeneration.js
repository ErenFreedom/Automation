const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 2 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
}

function decryptData(data) {
    const bytes = CryptoJS.AES.decrypt(data, process.env.SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {
    generateOTP,
    sendOTPEmail,
    decryptData
};
