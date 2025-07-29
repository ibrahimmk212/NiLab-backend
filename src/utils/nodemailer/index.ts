// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//     options: {
//         service: appConfig.nodemailer.service as 'gmail'
//     },
//     // secureConnection: false,
//     requireTLS: true,
//     // host: process.env.SMTP_HOST,
//     port: appConfig.nodemailer.port,
//     auth: {
//         user: appConfig.nodemailer.user,
//         pass: appConfig.nodemailer.pass
//     },
//     logger: true
//     // debug: true,
// });

import nodemailer from 'nodemailer';
import appConfig from '../../config/appConfig';

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: appConfig.nodemailer.user,
        pass: appConfig.nodemailer.pass
    },
    requireTLS: true,
    logger: true
});

export default transporter;
