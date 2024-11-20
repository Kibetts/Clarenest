const Parent = require('../models/parent.model');
const Student = require('../models/student.model');
const StudentApplication = require('../models/studentApplication.model');
const Assessment = require('../models/assessment.model');
const User = require('../models/user.model');
const crypto = require('crypto');
const sendEmail = require('../utils/email.util');
const AppError = require('../utils/appError');

//  token creation
const createToken = () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
    return { rawToken, hashedToken };
};

exports.registerParent = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { email, name, phone, relationship } = req.body;

        // Check if parent already exists
        const existingParent = await Parent.findOne({ email });

        if (existingParent) {
            return next(new AppError('Email already registered', 400));
        }

        const student = await Student.findById(studentId)
            .populate('parent');
            
        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        if (student.parent) {
            return next(new AppError('Student already has a parent account associated', 400));
        }

        // Create parent without verification
        const parent = await Parent.create({
            name,
            email,
            phone,
            relationship,
            children: [studentId],
            status: 'active', // Set as active immediately
            isEmailVerified: true // Set as verified immediately
        });

        student.parent = parent._id;
        await student.save();

        res.status(201).json({
            status: 'success',
            message: 'Parent registration successful. You can now log in.',
            data: {
                parent: {
                    id: parent._id,
                    name: parent.name,
                    email: parent.email,
                    status: parent.status
                }
            }
        });
    } catch (err) {
        next(new AppError('Error registering parent account: ' + err.message, 500));
    }
};

exports.verifyParentAccount = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const parent = await Parent.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() },
            isEmailVerified: false
        }).select('+verificationToken +verificationTokenExpires +password');

        if (!parent) {
            return next(new AppError('Invalid or expired verification token', 400));
        }

        parent.status = 'active';
        parent.isEmailVerified = true;
        parent.verificationToken = undefined;
        parent.verificationTokenExpires = undefined;
        parent.password = req.body.password;
        await parent.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Parent account verified successfully. You can now log in.'
        });
    } catch (err) {
        next(new AppError('Error verifying parent account: ' + err.message, 500));
    }
};

exports.getAllParents = async (req, res, next) => {
    try {
        const parents = await Parent.find()
            .select('-password -verificationToken -verificationTokenExpires')
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

// exports.createParentAccount = async (req, res, next) => {
//     try {
//         console.log('Creating parent account with token:', req.params.token);

//         const hashedToken = crypto
//             .createHash('sha256')
//             .update(req.params.token)
//             .digest('hex');

//         const application = await StudentApplication.findOne({
//             parentAccountCreationToken: hashedToken,
//             parentAccountCreationTokenExpires: { $gt: Date.now() }
//         }).select('+parentAccountCreationToken +parentAccountCreationTokenExpires');

//         if (!application) {
//             return next(new AppError('Invalid or expired token', 400));
//         }

//         // Check for existing parent
//         const existingParent = await Parent.findOne({ 
//             email: application.parentInfo.email 
//         }).select('+verificationToken +verificationTokenExpires +isEmailVerified');

//         if (existingParent && existingParent.isEmailVerified) {
//             // If verified parent exists, add the student to their children
//             existingParent.children.addToSet(application.studentId);
//             await existingParent.save();

//             // Update application
//             application.parentAccountCreationToken = undefined;
//             application.parentAccountCreationTokenExpires = undefined;
//             await application.save();

//             return res.status(200).json({
//                 status: 'success',
//                 message: 'Student added to existing parent account successfully.'
//             });
//         }

//         // Generate verification token
//         const { rawToken, hashedToken: hashedVerificationToken } = createToken();

//         const newParent = await Parent.create({
//             name: application.parentInfo.name,
//             email: application.parentInfo.email,
//             password: req.body.password,
//             phoneNumber: application.parentInfo.phoneNumber,
//             role: 'parent',
//             relationship: application.parentInfo.relationship,
//             children: [application.studentId],
//             status: 'pending',
//             verificationToken: hashedVerificationToken,
//             verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
//             isEmailVerified: false
//         });

//         // Update application
//         application.parentAccountCreationToken = undefined;
//         application.parentAccountCreationTokenExpires = undefined;
//         await application.save();

//         // Send verification email
//         const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${rawToken}`;
//         await sendEmail({
//             email: newParent.email,
//             subject: 'Email Verification - Parent Account',
//             html: `
//                 <h1>Welcome to Clarenest International School</h1>
//                 <p>Dear ${newParent.name},</p>
//                 <p>Please verify your email address by clicking the button below:</p>
//                 <a href="${verificationURL}" 
//                    style="display: inline-block; padding: 10px 20px; 
//                           background-color: #4CAF50; color: white; 
//                           text-decoration: none; border-radius: 5px;">
//                     Verify Email
//                 </a>
//                 <p>If the button doesn't work, copy and paste this link:</p>
//                 <p>${verificationURL}</p>
//                 <p>This link will expire in 24 hours.</p>
//             `
//         });

//         res.status(201).json({
//             status: 'success',
//             message: 'Parent account created successfully. Please check your email to verify your account.'
//         });
//     } catch (err) {
//         console.error('Error creating parent account:', err);
//         next(new AppError('Error creating parent account: ' + err.message, 500));
//     }
// };

exports.createParentAccount = async (req, res, next) => {
    try {
        const { email, name, phone, relationship, password } = req.body;

        // Check for existing parent
        const existingParent = await Parent.findOne({ email });

        if (existingParent) {
            return next(new AppError('A parent with this email already exists', 400));
        }

        const newParent = await Parent.create({
            name,
            email,
            password,
            phone,
            relationship,
            status: 'active',
            isEmailVerified: true,
            role: 'parent'
        });

        res.status(201).json({
            status: 'success',
            message: 'Parent account created successfully. You can now log in.',
            data: {
                parent: {
                    id: newParent._id,
                    name: newParent.name,
                    email: newParent.email,
                    status: newParent.status
                }
            }
        });
    } catch (err) {
        next(new AppError('Error creating parent account: ' + err.message, 500));
    }
};

exports.createParent = async (req, res, next) => {
    try {
        // Check for existing parent
        const existingParent = await Parent.findOne({ email: req.body.email })
            

        if (existingParent && existingParent.isEmailVerified) {
            return next(new AppError('A parent with this email already exists', 400));
        }

        const newParent = await Parent.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber,
            relationship: req.body.relationship,
            children: req.body.children || [],
            emergencyContact: req.body.emergencyContact,
            status: 'active',
            role: 'parent'
        });

        // Generate verification token
        const { rawToken, hashedToken } = createToken();
        
        newParent.verificationToken = hashedToken;
        newParent.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await newParent.save({ validateBeforeSave: false });

        // Send verification email
        const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${rawToken}`;
        await sendEmail({
            email: newParent.email,
            subject: 'Email Verification - Parent Account',
            html: `
                <h2>Welcome to Clarenest International School</h2>
                <p>Dear ${newParent.name},</p>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="${verificationURL}" 
                   style="display: inline-block; padding: 10px 20px; 
                          background-color: #4CAF50; color: white; 
                          text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
                <p>If the button doesn't work, copy and paste this link:</p>
                <p>${verificationURL}</p>
                <p>This link will expire in 24 hours.</p>
            `
        });

        // If parent has children, update their parent reference
        if (newParent.children.length > 0) {
            await Student.updateMany(
                { _id: { $in: newParent.children } },
                { $set: { parent: newParent._id } }
            );
        }

        res.status(201).json({
            status: 'success',
            message: 'Parent account created successfully. Please check your email to verify your account.',
            data: {
                parent: {
                    id: newParent._id,
                    name: newParent.name,
                    email: newParent.email,
                    role: newParent.role,
                    status: newParent.status
                }
            }
        });

    } catch (err) {
        next(new AppError('Error creating parent account: ' + err.message, 500));
    }
};

exports.getParent = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id)
            .select('-password -verificationToken -verificationTokenExpires')
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
        ).select('-password -verificationToken -verificationTokenExpires');

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
            .select('+verificationToken +verificationTokenExpires')
            .populate({
                path: 'children',
                select: 'name feeStatus totalFees paidFees nextPaymentDue'
            });

        if (!parent) {
            return next(new AppError('Parent not found', 404));
        }

        // Calculate total finances across all children
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

        // Calculate totals
        financialSummary.children.forEach(child => {
            financialSummary.totalFees += child.totalFees;
            financialSummary.totalPaid += child.paidFees;
            financialSummary.totalPending += child.pendingFees;
        });

        // Get payment history
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
        const parent = await Parent.findById(req.params.id)
            .select('+verificationToken +verificationTokenExpires');

        if (!parent) {
            return next(new AppError('Parent not found', 404));
        }

        // Update finances
        if (req.body.finances) {
            parent.finances = {
                ...parent.finances,
                ...req.body.finances
            };

            // Add to payment history if payment is being recorded
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