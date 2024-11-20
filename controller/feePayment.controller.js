const User = require('../models/user.model');
const Student = require('../models/student.model');
const FeePayment = require('../models/feePayment.model');
const AppError = require('../utils/appError');
const { sendNotification } = require('../utils/notification.util');

exports.recordPayment = async (req, res, next) => {
    try {
        const { studentId, amount, paymentMethod, notes } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        const totalFees = student.totalFees || 0;
        const currentPaidFees = student.paidFees || 0;
        const newPaidAmount = currentPaidFees + parseFloat(amount);

        // Create payment record
        const payment = await FeePayment.create({
            student: studentId,
            amount: parseFloat(amount),
            paymentMethod,
            notes,
            paymentDate: new Date()
        });

        // Update student's fee status
        student.paidFees = newPaidAmount;
        if (newPaidAmount >= totalFees) {
            student.feeStatus = 'paid';
            student.nextPaymentDue = null;
        } else {
            student.feeStatus = 'partial';
            student.nextPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        await student.save();

        // Send notification
        await sendNotification(
            student._id,
            `Payment of $${amount} recorded successfully.`,
            'payment'
        );

        res.status(201).json({
            status: 'success',
            data: {
                payment,
                student: {
                    id: student._id,
                    name: student.name,
                    grade: student.grade,
                    totalFees: student.totalFees,
                    paidFees: student.paidFees,
                    feeStatus: student.feeStatus
                }
            }
        });
    } catch (err) {
        next(new AppError('Error recording payment: ' + err.message, 500));
    }
};

exports.grantTemporaryAccess = async (req, res, next) => {
    try {
        const { studentId, durationInDays } = req.body;

        if (!studentId || !durationInDays) {
            return next(new AppError('Student ID and duration are required', 400));
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        // Set temporary access
        student.temporaryAccess = {
            granted: true,
            expiresAt: new Date(Date.now() + (durationInDays * 24 * 60 * 60 * 1000))
        };

        await student.save();

        await sendNotification(
            student._id,
            `You have been granted temporary access for ${durationInDays} days.`,
            'access_granted'
        );

        res.status(200).json({
            status: 'success',
            message: 'Temporary access granted successfully',
            data: {
                temporaryAccess: student.temporaryAccess
            }
        });
    } catch (err) {
        next(new AppError('Error granting temporary access: ' + err.message, 500));
    }
};

exports.getPayments = async (req, res, next) => {
    try {
        const payments = await FeePayment.find()
            .populate('student', 'name grade')
            .sort('-paymentDate');

        res.status(200).json({
            status: 'success',
            data: {
                payments
            }
        });
    } catch (err) {
        next(new AppError('Error fetching payments', 500));
    }
};

exports.getStudentPayments = async (req, res, next) => {
    try {
        const payments = await FeePayment.find({ student: req.params.studentId })
            .populate('student', 'name grade')
            .sort('-paymentDate');

        res.status(200).json({
            status: 'success',
            data: {
                payments
            }
        });
    } catch (err) {
        next(new AppError('Error fetching student payments', 500));
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