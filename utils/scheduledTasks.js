// const cron = require('node-cron');
// const User = require('../models/user.model');
// const notificationController = require('../controller/notification.controller');

// const checkOverdueFees = async () => {
//     const now = new Date();
//     const overdueFees = await User.find({
//         role: 'student',
//         feeStatus: 'partial',
//         nextPaymentDue: { $lt: now }
//     });

//     for (let student of overdueFees) {
//         student.feeStatus = 'unpaid';
//         await student.save();

//         // Create notification using the controller
//         await notificationController.createNotification({
//             body: {
//                 recipient: student._id,
//                 message: 'Your fees are now overdue. Please make a payment to regain access to resources.',
//                 type: 'Other'
//             }
//         }, {
//             status: (statusCode) => ({
//                 json: (data) => {
//                     console.log(`Notification sent to student ${student._id}: ${statusCode}`);
//                 }
//             })
//         });
//     }
// };

// // Schedule the task to run every day at midnight
// const scheduleOverdueFeeCheck = () => {
//     cron.schedule('0 0 * * *', checkOverdueFees);
// };

// // Run the check immediately when the server starts
// const runOverdueFeeCheckImmediately = () => {
//     checkOverdueFees();
// };

// module.exports = {
//     scheduleOverdueFeeCheck,
//     runOverdueFeeCheckImmediately
// };

const cron = require('node-cron');
const User = require('../models/user.model');
const notificationController = require('../controller/notification.controller');

const checkOverdueFees = async () => {
    const now = new Date();
    const overdueFees = await User.find({
        role: 'student',
        feeStatus: 'partial',
        nextPaymentDue: { $lt: now }
    });

    for (let student of overdueFees) {
        student.feeStatus = 'unpaid';
        await student.save();

        // Create notification using the controller
        await notificationController.createNotification({
            body: {
                recipient: student._id,
                message: 'Your fees are now overdue. Please make a payment to regain access to resources.',
                type: 'Other'
            }
        }, {
            status: (statusCode) => ({
                json: (data) => {
                    console.log(`Notification sent to student ${student._id}: ${statusCode}`);
                }
            })
        });
    }
};

// Schedule the task to run every day at midnight
const scheduleOverdueFeeCheck = () => {
    cron.schedule('0 0 * * *', checkOverdueFees);
    console.log('Scheduled overduecheck');
};

// Run the check immediately when the server starts
const runOverdueFeeCheckImmediately = () => {
    checkOverdueFees();
    console.log('Ran overduecheck immediately');
};

module.exports = {
    scheduleOverdueFeeCheck,
    runOverdueFeeCheckImmediately
};