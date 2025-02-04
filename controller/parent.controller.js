const Parent = require('../models/parent.model');
const StudentApplication = require('../models/studentApplication.model');
const Student = require('../models/student.model');
const Assessment = require('../models/assessment.model');
const FeePayment = require('../models/feePayment.model');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const crypto = require('crypto');



// exports.createParentAccount = async (req, res, next) => {
//     try {
//         const hashedToken = crypto
//             .createHash('sha256')
//             .update(req.params.token)
//             .digest('hex');

//         const application = await StudentApplication.findOne({
//             parentAccountCreationToken: hashedToken,
//             parentAccountCreationTokenExpires: { $gt: Date.now() },
//             status: 'approved'
//         });

//         if (!application) {
//             return next(new AppError('Invalid or expired token', 400));
//         }

//         if (!req.body.password) {
//             return next(new AppError('Password is required', 400));
//         }

//         // Check for existing parent
//         const existingParent = await Parent.findOne({ 
//             email: application.parentInfo.email 
//         });

//         if (existingParent) {
//             return next(new AppError('A parent with this email already exists', 400));
//         }

//         // Create parent account
//         const newParent = await Parent.create({
//             name: application.parentInfo.name,
//             email: application.parentInfo.email,
//             password: req.body.password,
//             phone: application.parentInfo.phoneNumber,
//             relationship: application.parentInfo.relationship,
//             status: 'offline',
//             isEmailVerified: true,
//             role: 'parent'
//         });

//         // Clear token after successful account creation
//         application.parentAccountCreationToken = undefined;
//         application.parentAccountCreationTokenExpires = undefined;
//         await application.save();

//         // Generate token for immediate login
//         const token = jwt.sign(
//             { id: newParent._id, role: 'parent' },
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRES_IN }
//         );

//         res.status(201).json({
//             status: 'success',
//             message: 'Parent account created successfully',
//             data: {
//                 parent: {
//                     id: newParent._id,
//                     name: newParent.name,
//                     email: newParent.email,
//                     role: newParent.role,
//                     status: newParent.status
//                 },
//                 token
//             }
//         });
//     } catch (err) {
//         next(new AppError('Error creating parent account: ' + err.message, 500));
//     }
// };


exports.createParentAccount = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const application = await StudentApplication.findOne({
            parentAccountCreationToken: hashedToken,
            parentAccountCreationTokenExpires: { $gt: Date.now() }
        });

        if (!application) {
            return next(new AppError('Invalid or expired token', 400));
        }

        if (!req.body.password) {
            return next(new AppError('Password is required', 400));
        }

        // Check for existing parent
        const existingParent = await Parent.findOne({ 
            email: application.parentInfo.email 
        });

        if (existingParent) {
            return next(new AppError('A parent with this email already exists', 400));
        }

        // Find the associated student
        const student = await Student.findOne({ 
            email: application.personalInfo.email 
        });

        // Create parent account
        const newParent = await Parent.create({
            name: application.parentInfo.name,
            email: application.parentInfo.email,
            password: req.body.password,
            phone: application.parentInfo.phoneNumber,
            relationship: application.parentInfo.relationship,
            children: student ? [student._id] : [],
            status: 'offline',
            isEmailVerified: true,
            role: 'parent'
        });

        // Update student with parent reference if student exists
        if (student) {
            student.parent = newParent._id;
            await student.save();
        }

        // Clear token after successful account creation
        application.parentAccountCreationToken = undefined;
        application.parentAccountCreationTokenExpires = undefined;
        await application.save();

        // Generate token for immediate login
        const token = jwt.sign(
            { id: newParent._id, role: 'parent' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            status: 'success',
            message: 'Parent account created successfully',
            data: {
                parent: {
                    id: newParent._id,
                    name: newParent.name,
                    email: newParent.email,
                    role: newParent.role,
                    status: newParent.status
                },
                token
            }
        });
    } catch (err) {
        next(new AppError('Error creating parent account: ' + err.message, 500));
    }
};


exports.getAllParents = async (req, res, next) => {
    try {
        const parents = await Parent.find()
            .select('-password')
            .populate('children');

        res.status(200).json({
            status: 'success',
            results: parents.length,
            data: { parents }
        });
    } catch (err) {
        next(new AppError('Error fetching parents', 500));
    }
};

exports.getParent = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id)
            .select('-password')
            .populate('children');

        if (!parent) {
            return next(new AppError('No parent found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { parent }
        });
    } catch (err) {
        next(new AppError('Error fetching parent', 500));
    }
};

exports.updateParent = async (req, res, next) => {
    try {
        const parent = await Parent.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!parent) {
            return next(new AppError('No parent found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { parent }
        });
    } catch (err) {
        next(new AppError('Error updating parent', 500));
    }
};

exports.deleteParent = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id);

        if (!parent) {
            return next(new AppError('No parent found with that ID', 404));
        }

        // Update all associated students
        await Student.updateMany(
            { parent: parent._id },
            { $unset: { parent: 1 } }
        );

        await Parent.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(new AppError('Error deleting parent', 500));
    }
};

exports.getParentChildren = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id)
            .populate({
                path: 'children',
                select: '-password'
            });

        if (!parent) {
            return next(new AppError('No parent found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            results: parent.children.length,
            data: { children: parent.children }
        });
    } catch (err) {
        next(new AppError('Error fetching parent children', 500));
    }
};

exports.getChildAssessments = async (req, res, next) => {
    try {
        const child = await Student.findById(req.params.childId)
            .populate('parent');
            
        if (!child) {
            return next(new AppError('Child not found', 404));
        }

        if (child.parent.toString() !== req.user._id.toString()) {
            return next(new AppError('You are not authorized to view this child\'s assessments', 403));
        }

        const assessments = await Assessment.find({
            gradeLevel: child.grade,
            isActive: true
        }).populate('subject');

        res.status(200).json({
            status: 'success',
            data: { assessments }
        });
    } catch (err) {
        next(new AppError('Error fetching child assessments', 500));
    }
};

exports.getParentFinances = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id)
            .populate({
                path: 'children',
                select: 'name feeStatus totalFees paidFees nextPaymentDue'
            });

        if (!parent) {
            return next(new AppError('Parent not found', 404));
        }

        const financialSummary = {
            totalFees: 0,
            totalPaid: 0,
            totalPending: 0,
            children: parent.children.map(child => ({
                name: child.name,
                feeStatus: child.feeStatus,
                totalFees: child.totalFees,
                paidFees: child.paidFees,
                pendingFees: child.totalFees - child.paidFees,
                nextPaymentDue: child.nextPaymentDue
            }))
        };

        financialSummary.children.forEach(child => {
            financialSummary.totalFees += child.totalFees;
            financialSummary.totalPaid += child.paidFees;
            financialSummary.totalPending += child.pendingFees;
        });

        const paymentHistory = await FeePayment.find({
            student: { $in: parent.children.map(child => child._id) }
        }).sort('-paymentDate');

        res.status(200).json({
            status: 'success',
            data: {
                summary: financialSummary,
                paymentHistory
            }
        });
    } catch (err) {
        next(new AppError('Error fetching parent finances', 500));
    }
};

exports.updateParentFinances = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id);

        if (!parent) {
            return next(new AppError('Parent not found', 404));
        }

        if (req.body.finances) {
            parent.finances = {
                ...parent.finances,
                ...req.body.finances
            };

            if (req.body.finances.payment) {
                parent.finances.paymentHistory.push({
                    amount: req.body.finances.payment,
                    date: new Date(),
                    description: req.body.finances.description || 'Fee payment'
                });
            }
        }

        await parent.save();

        res.status(200).json({
            status: 'success',
            data: {
                finances: parent.finances
            }
        });
    } catch (err) {
        next(new AppError('Error updating parent finances', 500));
    }
};

module.exports = exports;