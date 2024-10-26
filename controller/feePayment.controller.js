const User = require('../models/user.model');
const FeePayment = require('../models/feePayment.model');
const AppError = require('../utils/appError');
const { sendNotification } = require('../utils/notification.util');

exports.recordPayment = async (req, res, next) => {
    try {
        const { studentId, amount, paymentMethod, transactionId, notes } = req.body;

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return next(new AppError('Student not found', 404));
        }

        const payment = await FeePayment.create({
            student: studentId,
            amount,
            paymentMethod,
            transactionId,
            notes
        });

        student.paidFees += amount;
        if (student.paidFees >= student.totalFees) {
            student.feeStatus = 'paid';
            student.nextPaymentDue = null;
        } else {
            student.feeStatus = 'partial';
            // Set next payment due date to 30 days from now
            student.nextPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        await student.save();

        // Send notification to student
        await sendNotification(
            student._id,
            `A payment of ${amount} has been recorded for your account.`,
            'Other'
        );
        res.status(201).json({
            status: 'success',
            data: {
                payment,
                studentFeeStatus: student.feeStatus
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.grantTemporaryAccess = async (req, res, next) => {
    try {
        const { studentId, durationInDays } = req.body;

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return next(new AppError('Student not found', 404));
        }

        student.temporaryAccess.granted = true;
        student.temporaryAccess.expiresAt = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000);

        await student.save();

        // Send notification to student
        await sendNotification(
            student._id,
            `You have been granted temporary access for ${durationInDays} days.`,
            'Other'
        );
        res.status(200).json({
            status: 'success',
            data: {
                temporaryAccess: student.temporaryAccess
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getPaymentHistory = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        const payments = await FeePayment.find({ student: studentId }).sort('-paymentDate');

        res.status(200).json({
            status: 'success',
            data: {
                payments
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = exports;