const StudentApplication = require('../models/studentApplication.model');
const TutorApplication = require('../models/tutorApplication.model');
const User = require('../models/user.model');
const crypto = require('crypto');
const sendEmail = require('../utils/email.util');
const AppError = require('../utils/appError');
const { validateStudentApplication, validateTutorApplication } = require('../validators/applicationValidators');

// Student Application Functions
exports.submitStudentApplication = async (req, res, next) => {
    try {
        const { error } = validateStudentApplication(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        const newApplication = await StudentApplication.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Student application submitted successfully. We will review your application and contact you soon.',
            data: {
                applicationId: newApplication._id
            }
        });
    } catch (err) {
        next(new AppError('Error submitting application', 500));
    }
};

exports.approveStudentApplication = async (req, res, next) => {
    try {
        const application = await StudentApplication.findById(req.params.id);
        if (!application) {
            return next(new AppError('Student application not found', 404));
        }
        application.status = 'approved';
        application.accountCreationToken = crypto.randomBytes(32).toString('hex');
        application.accountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await application.save();

        const accountCreationURL = `${process.env.FRONTEND_URL}/create-account/${application.accountCreationToken}`;
        const message = `Congratulations! Your student application has been approved. Please create your account by clicking on the following link: ${accountCreationURL}`;

        await sendEmail({
            email: application.personalInfo.email,
            subject: 'Student Application Approved - Create Your Account',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Student application approved. An invitation to create an account has been sent to the applicant.'
        });
    } catch (err) {
        next(new AppError('Error approving application', 500));
    }
};

exports.createStudentAccount = async (req, res, next) => {
    try {
        const application = await StudentApplication.findOne({
            accountCreationToken: req.params.token,
            accountCreationTokenExpires: { $gt: Date.now() }
        });

        if (!application) {
            return next(new AppError('Invalid or expired token', 400));
        }

        const newUser = await User.create({
            name: application.personalInfo.fullName,
            email: application.personalInfo.email,
            password: req.body.password,
            role: 'student',
            grade: application.educationalInfo.currentGradeLevel
        });

        application.status = 'account_created';
        application.accountCreationToken = undefined;
        application.accountCreationTokenExpires = undefined;
        await application.save();

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        newUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await newUser.save({ validateBeforeSave: false });

        // Send verification email
        const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on the following link: ${verificationURL}`;

        await sendEmail({
            email: newUser.email,
            subject: 'Email Verification',
            message
        });

        res.status(201).json({
            status: 'success',
            message: 'Student account created successfully. Please check your email to verify your account.'
        });
    } catch (err) {
        next(new AppError('Error creating account', 500));
    }
};

// Tutor Application Functions
exports.submitTutorApplication = async (req, res, next) => {
    try {
        const { error } = validateTutorApplication(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        const newApplication = await TutorApplication.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Tutor application submitted successfully. We will review your application and contact you soon.',
            data: {
                applicationId: newApplication._id
            }
        });
    } catch (err) {
        next(new AppError('Error submitting application', 500));
    }
};

exports.approveTutorApplication = async (req, res, next) => {
    try {
        const application = await TutorApplication.findById(req.params.id);
        if (!application) {
            return next(new AppError('Tutor application not found', 404));
        }
        application.status = 'approved';
        application.accountCreationToken = crypto.randomBytes(32).toString('hex');
        application.accountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await application.save();

        const accountCreationURL = `${process.env.FRONTEND_URL}/create-account/${application.accountCreationToken}`;
        const message = `Congratulations! Your tutor application has been approved. Please create your account by clicking on the following link: ${accountCreationURL}`;

        await sendEmail({
            email: application.personalInfo.email,
            subject: 'Tutor Application Approved - Create Your Account',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Tutor application approved. An invitation to create an account has been sent to the applicant.'
        });
    } catch (err) {
        next(new AppError('Error approving application', 500));
    }
};

exports.createTutorAccount = async (req, res, next) => {
    try {
        const application = await TutorApplication.findOne({
            accountCreationToken: req.params.token,
            accountCreationTokenExpires: { $gt: Date.now() }
        });

        if (!application) {
            return next(new AppError('Invalid or expired token', 400));
        }

        const newUser = await User.create({
            name: application.personalInfo.fullName,
            email: application.personalInfo.email,
            password: req.body.password,
            role: 'tutor',
            subjects: application.professionalInfo.subjectsSpecialization
        });

        application.status = 'account_created';
        application.accountCreationToken = undefined;
        application.accountCreationTokenExpires = undefined;
        await application.save();

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        newUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await newUser.save({ validateBeforeSave: false });

        // Send verification email
        const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on the following link: ${verificationURL}`;

        await sendEmail({
            email: newUser.email,
            subject: 'Email Verification',
            message
        });

        res.status(201).json({
            status: 'success',
            message: 'Tutor account created successfully. Please check your email to verify your account.'
        });
    } catch (err) {
        next(new AppError('Error creating account', 500));
    }
};

// Common functions for both student and tutor applications
exports.getAllApplications = async (req, res, next) => {
    try {
        const studentApplications = await StudentApplication.find();
        const tutorApplications = await TutorApplication.find();
        
        res.status(200).json({
            status: 'success',
            data: {
                studentApplications,
                tutorApplications
            }
        });
    } catch (err) {
        next(new AppError('Error fetching applications', 500));
    }
};

exports.getApplicationById = async (req, res, next) => {
    try {
        const { id, type } = req.params;
        let application;

        if (type === 'student') {
            application = await StudentApplication.findById(id);
        } else if (type === 'tutor') {
            application = await TutorApplication.findById(id);
        } else {
            return next(new AppError('Invalid application type', 400));
        }

        if (!application) {
            return next(new AppError('Application not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                application
            }
        });
    } catch (err) {
        next(new AppError('Error fetching application', 500));
    }
};

exports.updateApplication = async (req, res, next) => {
    try {
        const { id, type } = req.params;
        let application;

        if (type === 'student') {
            application = await StudentApplication.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        } else if (type === 'tutor') {
            application = await TutorApplication.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        } else {
            return next(new AppError('Invalid application type', 400));
        }

        if (!application) {
            return next(new AppError('Application not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                application
            }
        });
    } catch (err) {
        next(new AppError('Error updating application', 500));
    }
};

exports.rejectApplication = async (req, res, next) => {
    try {
        const { id, type } = req.params;
        let application;

        if (type === 'student') {
            application = await StudentApplication.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
        } else if (type === 'tutor') {
            application = await TutorApplication.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
        } else {
            return next(new AppError('Invalid application type', 400));
        }

        if (!application) {
            return next(new AppError('Application not found', 404));
        }

        // Send rejection email
        await sendEmail({
            email: application.personalInfo.email,
            subject: 'Application Status Update',
            message: 'We regret to inform you that your application has been rejected. Thank you for your interest.'
        });

        res.status(200).json({
            status: 'success',
            message: 'Application rejected successfully.'
        });
    } catch (err) {
        next(new AppError('Error rejecting application', 500));
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (err) {
        next(new AppError('Error verifying email', 500));
    }
};