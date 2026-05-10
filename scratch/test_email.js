const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('Attempting to send test email...');
console.log('User:', process.env.EMAIL_USER);
// Mask pass for safety
console.log('Pass Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

transporter.sendMail({
    from: `"Terminus Test" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_FROM, // Send to self
    subject: 'Test Email from Terminus',
    text: 'If you see this, email is working!'
}).then(info => {
    console.log('SUCCESS:', info.messageId);
    process.exit(0);
}).catch(err => {
    console.error('FAILURE:', err);
    process.exit(1);
});
