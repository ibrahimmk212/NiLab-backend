import nodemailer from 'nodemailer';
import appConfig from '../../config/appConfig';

export const mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: appConfig.mailer.user, // example@gmail.com
        pass: appConfig.mailer.pass // APP PASSWORD
    }
});

// // Create a reusable transporter object using SMTP transport
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: appConfig.nodemailer.user,
//         pass: appConfig.nodemailer.pass
//     },
//     requireTLS: true,
//     logger: true
// });

// export default transporter;
