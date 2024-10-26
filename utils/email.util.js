// const nodemailer = require('nodemailer');

// const sendEmail = async options => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });

//     const mailOptions = {
//         from: 'clarenest@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// };

// module.exports = sendEmail;

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async options => {
    try {
        const msg = {
            to: options.email,
            from: {
                email: process.env.EMAIL_FROM,
                name: 'Clarenest International School'
            },
            subject: options.subject,
            text: options.message,
            html: options.html || options.message.replace(/\n/g, '<br>')
        };

        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;