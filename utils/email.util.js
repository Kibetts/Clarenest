// const sgMail = require('@sendgrid/mail');
// const AppError = require('./appError');

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = async (options) => {
//     try {
//         const msg = {
//             to: options.email,
//             from: {
//                 email: process.env.EMAIL_FROM || 'clarenestschool@gmail.com',
//                 name: 'Clarenest International School'
//             },
//             subject: options.subject,
//             text: options.message,
//             html: options.html || options.message.replace(/\n/g, '<br>')
//         };

//         // Add retry logic
//         let retries = 3;
//         let lastError;

//         while (retries > 0) {
//             try {
//                 await sgMail.send(msg);
//                 console.log('Email sent successfully');
//                 return;
//             } catch (error) {
//                 lastError = error;
//                 console.log(`Email sending attempt failed. Retries left: ${retries - 1}`);
//                 if (error.code === 'EAI_AGAIN') {
//                     // DNS error - wait before retrying
//                     await new Promise(resolve => setTimeout(resolve, 2000));
//                 }
//                 retries--;
//             }
//         }

//         // If we get here, all retries failed
//         console.error('Failed to send email after retries:', lastError);
        
//         // Don't throw error, just log it and continue
//         console.log('Continuing without email send. Email details:', {
//             to: options.email,
//             subject: options.subject
//         });

//     } catch (error) {
//         console.error('Error in email service:', error);
//         // Don't throw error, just log it
//         console.log('Email service encountered an error. Continuing without email send.');
//     }
// };

// module.exports = sendEmail;


const nodemailer = require('nodemailer');
const AppError = require('./appError');

// reusable transporter object using Brevo SMTP
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = async (options) => {
    try {
        const msg = {
            from: {
                name: 'Clarenest International School',
                address: process.env.EMAIL_FROM || 'admin@clarenestschool.co.ke'
            },
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || options.message.replace(/\n/g, '<br>')
        };

        // retry logic
        let retries = 3;
        let lastError;

        while (retries > 0) {
            try {
                const info = await transporter.sendMail(msg);
                console.log('Email sent successfully:', info.messageId);
                return;
            } catch (error) {
                lastError = error;
                console.log(`Email sending attempt failed. Retries left: ${retries - 1}`);
                if (error.code === 'ECONNECTION' || error.code === 'EAI_AGAIN') {
                    // Connection or DNS error - wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                retries--;
            }
        }

        // If we get here, all retries failed
        console.error('Failed to send email after retries:', lastError);
        
        // Don't throw error, just log it and continue
        console.log('Continuing without email send. Email details:', {
            to: options.email,
            subject: options.subject
        });

    } catch (error) {
        console.error('Error in email service:', error);
        // Don't throw error, just log it
        console.log('Email service encountered an error. Continuing without email send.');
    }
};

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP connection error:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

module.exports = sendEmail;