const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"Roamly" <${config.EMAIL_USER}>`,
            to,
            subject,
            html
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed:', error.message);
    }
};

module.exports = sendEmail;
