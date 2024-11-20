const sgMail = require('@sendgrid/mail');
const AppError = require('./appError');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    try {
        const msg = {
            to: options.email,
            from: {
                email: process.env.EMAIL_FROM || 'clarenestschool@gmail.com',
                name: 'Clarenest International School'
            },
            subject: options.subject,
            text: options.message,
            html: options.html || options.message.replace(/\n/g, '<br>')
        };

        // Add retry logic
        let retries = 3;
        let lastError;

        while (retries > 0) {
            try {
                await sgMail.send(msg);
                console.log('Email sent successfully');
                return;
            } catch (error) {
                lastError = error;
                console.log(`Email sending attempt failed. Retries left: ${retries - 1}`);
                if (error.code === 'EAI_AGAIN') {
                    // DNS error - wait before retrying
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

module.exports = sendEmail;