const fs = require('fs');
const { promisify } = require('util');
const StudentApplication = require('../models/studentApplication.model');
const TutorApplication = require('../models/tutorApplication.model');
const User = require('../models/user.model');
const crypto = require('crypto');
const sendEmail = require('../utils/email.util');
const AppError = require('../utils/appError');
const { uploadFile } = require('../utils/fileUpload.util');
const { validateStudentApplication, validateTutorApplication, validateTutorFiles } = require('../validators/applicationValidators');


// Student Application Functions
exports.submitStudentApplication = async (req, res, next) => {
    try {
        // Validate the data
        const { error } = validateStudentApplication(req.body);
        if (error) {
            return next(new AppError(error.details[0].message, 400));
        }

        // Check if email already exists
        const existingApplication = await StudentApplication.findOne({
            'personalInfo.email': req.body.personalInfo.email,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingApplication) {
            return next(new AppError('An application with this email already exists', 400));
        }

        // Create the application
        const newApplication = await StudentApplication.create({
            ...req.body,
            status: 'pending'
        });

        // Send confirmation email
        await sendEmail({
            email: req.body.personalInfo.email,
            subject: 'Student Application Received',
            message: 'Your application has been received and is under review. We will contact you once the review process is complete.'
        });

        res.status(201).json({
            status: 'success',
            message: 'Application submitted successfully. We will review your application and contact you soon.',
            data: {
                applicationId: newApplication._id
            }
        });
    } catch (err) {
        next(new AppError('Error submitting application: ' + err.message, 500));
    }
};

exports.approveStudentApplication = async (req, res, next) => {
    try {
        const application = await StudentApplication.findById(req.params.id);
        if (!application) {
            return next(new AppError('Student application not found', 404));
        }

        if (application.status !== 'pending') {
            return next(new AppError('Application has already been processed', 400));
        }

        // Generate account creation token
        const accountCreationToken = crypto.randomBytes(32).toString('hex');
        
        // Update application status and set token
        application.status = 'approved';
        application.accountCreationToken = crypto.createHash('sha256')
            .update(accountCreationToken)
            .digest('hex');
        application.accountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        await application.save();

        // Send account creation email
        const accountCreationURL = `${process.env.FRONTEND_URL}/create-account/student/${accountCreationToken}`;
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
        next(new AppError('Error approving application: ' + err.message, 500));
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
        // First validate the files
        if (!req.files || Object.keys(req.files).length === 0) {
            return next(new AppError('No files were uploaded', 400));
        }

        const filesValidation = validateTutorFiles(req.files);
        if (filesValidation.error) {
            return next(new AppError(filesValidation.error.details[0].message, 400));
        }

        // Parse and validate application data
        let applicationData;
        try {
            applicationData = typeof req.body.application === 'string' 
                ? JSON.parse(req.body.application) 
                : req.body.application;
        } catch (error) {
            return next(new AppError('Invalid application data format', 400));
        }

        const { error } = validateTutorApplication(applicationData);
        if (error) {
            return next(new AppError(error.details[0].message, 400));
        }

        // Check if an application with this email already exists
        const existingApplication = await TutorApplication.findOne({
            'personalInfo.email': applicationData.personalInfo.email,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingApplication) {
            return next(new AppError('An application with this email already exists', 400));
        }

        // Create the application with pending status
        const newApplication = await TutorApplication.create({
            ...applicationData,
            documents: {
                cv: {
                    filename: req.files.cv[0].originalname,
                    path: req.files.cv[0].path,
                    mimetype: req.files.cv[0].mimetype
                },
                academicCertificates: req.files.academicCertificates.map(file => ({
                    filename: file.originalname,
                    path: file.path,
                    mimetype: file.mimetype
                })),
                governmentId: {
                    filename: req.files.governmentId[0].originalname,
                    path: req.files.governmentId[0].path,
                    mimetype: req.files.governmentId[0].mimetype
                }
            },
            status: 'pending'
        });

        // Send confirmation email
        await sendEmail({
            email: applicationData.personalInfo.email,
            subject: 'Tutor Application Received',
            message: 'Your application has been received and is under review. We will contact you once the review process is complete.'
        });

        res.status(201).json({
            status: 'success',
            message: 'Application submitted successfully. We will review your application and contact you soon.',
            data: {
                applicationId: newApplication._id
            }
        });
    } catch (err) {
        // Clean up any uploaded files if there's an error
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        next(new AppError(`Error submitting application: ${err.message}`, 500));
    }
};

exports.approveTutorApplication = async (req, res, next) => {
    try {
        // Find the application and populate user data if exists
        const application = await TutorApplication.findById(req.params.id);

        if (!application) {
            return next(new AppError('Tutor application not found', 404));
        }

        // Debug log to check application structure  TO REMOVE LATER
        console.log('Application data:', {
            id: application._id,
            status: application.status,
            personalInfo: application.personalInfo
        });

        if (application.status !== 'pending') {
            return next(new AppError('Application has already been processed', 400));
        }

        // More robust email extraction
        let emailToUse;
        if (application.personalInfo && application.personalInfo.email) {
            emailToUse = application.personalInfo.email;
        } else if (application.email) { // Fallback to direct email property if exists
            emailToUse = application.email;
        } else if (application.user && application.user.email) {
            emailToUse = application.user.email;
        }

        // Debug log for email extraction
        console.log('Email extraction:', {
            fromPersonalInfo: application.personalInfo?.email,
            directEmail: application.email,
            fromUser: application.user?.email,
            finalEmail: emailToUse
        });

        if (!emailToUse) {
            console.error('Email not found in application:', application);
            return next(new AppError('No valid email found for application. Please ensure the application includes an email address.', 400));
        }

        // Generate account creation token
        const accountCreationToken = crypto.randomBytes(32).toString('hex');
        
        // Update application status and set token
        application.status = 'approved';
        application.accountCreationToken = crypto.createHash('sha256')
            .update(accountCreationToken)
            .digest('hex');
        application.accountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        await application.save();

        // Send account creation email
        const accountCreationURL = `${process.env.FRONTEND_URL}/create-account/tutor/${accountCreationToken}`;
        const message = `Congratulations! Your tutor application has been approved. Please create your account by clicking on the following link: ${accountCreationURL}`;

        await sendEmail({
            email: emailToUse,
            subject: 'Tutor Application Approved - Create Your Account',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Tutor application approved. An invitation to create an account has been sent to the applicant.'
        });
    } catch (err) {
        console.error('Tutor application approval error:', {
            error: err.message,
            stack: err.stack,
            applicationId: req.params.id
        });
        next(new AppError(`Error approving application: ${err.message}`, 500));
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

//Remove this method
// exports.verifyEmail = async (req, res, next) => {
//     try {
//         const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

//         const user = await User.findOne({
//             verificationToken: hashedToken,
//             verificationTokenExpires: { $gt: Date.now() }
//         });

//         if (!user) {
//             return next(new AppError('Token is invalid or has expired', 400));
//         }

//         user.isEmailVerified = true;
//         user.verificationToken = undefined;
//         user.verificationTokenExpires = undefined;
//         await user.save({ validateBeforeSave: false });

//         res.status(200).json({
//             status: 'success',
//             message: 'Email verified successfully. You can now log in.'
//         });
//     } catch (err) {
//         next(new AppError('Error verifying email', 500));
//     }
// };