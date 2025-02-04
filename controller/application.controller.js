const fs = require('fs');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const StudentApplication = require('../models/studentApplication.model');
const TutorApplication = require('../models/tutorApplication.model');
const User = require('../models/user.model');
const Parent = require('../models/parent.model');
const crypto = require('crypto');
const sendEmail = require('../utils/email.util');
const AppError = require('../utils/appError');
const { uploadFile } = require('../utils/fileUpload.util');
const { validateStudentApplication, validateTutorApplication, validateTutorFiles } = require('../validators/applicationValidators');
const { enrollStudentInGradeSubjects } = require('../services/enrollment.service');

// Helper function for token creation
const createToken = () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
    return { rawToken, hashedToken };
};

// Helper function for signing JWT
const signToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

exports.submitStudentApplication = async (req, res, next) => {
    try {
        // Validate the data
        const { error } = validateStudentApplication(req.body);
        if (error) {
            return next(new AppError(error.details[0].message, 400));
        }

        // Check if an application with this email already exists
        const existingApplication = await StudentApplication.findOne({
            'personalInfo.email': req.body.personalInfo.email,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingApplication) {
            return next(new AppError('An application with this email already exists', 400));
        }

        // Create the application first
        const newApplication = await StudentApplication.create({
            ...req.body,
            status: 'pending'
        });

        // Try to send emails, but continue even if they fail
        try {
            // Send confirmation email to student
            await sendEmail({
                email: req.body.personalInfo.email,
                subject: 'Student Application Received',
                html: `
                    <h1>Application Received</h1>
                    <p>Dear ${req.body.personalInfo.fullName},</p>
                    <p>Your application to Clarenest International School has been received and is under review.</p>
                    <p>We will contact you once the review process is complete.</p>
                    <p>Thank you for choosing Clarenest International School.</p>
                `
            });

            // Try to send parent notification email
            await sendEmail({
                email: req.body.parentInfo.email,
                subject: 'Child\'s Application to Clarenest International School',
                html: `
                    <h1>Clarenest International School Application Notice</h1>
                    <p>Dear ${req.body.parentInfo.name},</p>
                    <p>This email is to inform you that your child ${req.body.personalInfo.fullName} has submitted an application to Clarenest International School.</p>
                    <p>Once the application is reviewed and approved, you will receive another email with instructions to create your parent account.</p>
                    <p>Thank you for choosing Clarenest International School.</p>
                `
            });
        } catch (emailError) {
            // Log email error but don't fail the request
            console.error('Email notification failed:', emailError);
            // Could store this in a failed notifications queue for retry
        }

        // Always return success if the application was created
        res.status(201).json({
            status: 'success',
            message: 'Application submitted successfully. We will review your application and contact you soon.',
            data: {
                applicationId: newApplication._id
            }
        });

    } catch (err) {
        console.error('Application submission error:', err);
        next(new AppError('Error processing application', 500));
    }
};

// exports.approveStudentApplication = async (req, res, next) => {
//     try {
//         const application = await StudentApplication.findById(req.params.id);
//         if (!application) {
//             return next(new AppError('Student application not found', 404));
//         }

//         if (application.status !== 'pending') {
//             return next(new AppError('Application has already been processed', 400));
//         }

//         // Generate tokens for both student and parent
//         const studentTokens = createToken();
//         const parentTokens = createToken();

//         // Update application status and set student token
//         application.status = 'approved';
//         application.accountCreationToken = studentTokens.hashedToken;
//         application.accountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

//         // Store parent token in application
//         application.parentAccountCreationToken = parentTokens.hashedToken;
//         application.parentAccountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

//         // Validate email addresses before sending
//         if (!application.personalInfo.email) {
//             return next(new AppError('Student email is missing', 400));
//         }

//         if (!application.parentInfo.email) {
//             return next(new AppError('Parent email is missing', 400));
//         }

//         try {
//             await application.save();

//             // Send student account creation email
//             const studentURL = `${process.env.FRONTEND_URL}/create-account/student/${studentTokens.rawToken}`;
//             await sendEmail({
//                 email: application.personalInfo.email,
//                 subject: 'Student Application Approved - Create Your Account',
//                 html: `
//                     <h1>Application Approved!</h1>
//                     <p>Dear ${application.personalInfo.fullName},</p>
//                     <p>Your application to Clarenest International School has been approved.</p>
//                     <p>Please create your student account by clicking the button below:</p>
//                     <a href="${studentURL}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
//                         Create Student Account
//                     </a>
//                     <p>This link will expire in 24 hours.</p>
//                     <p>If the button doesn't work, copy and paste this URL into your browser:</p>
//                     <p>${studentURL}</p>
//                 `
//             });

//             // Send parent account creation email
//             // const parentURL = `${process.env.FRONTEND_URL}/create-account/parent/${parentTokens.rawToken}`;
//             const parentURL = `${process.env.REACT_APP_FRONTEND_URL}/parent/register/${studentId}`;



//             await sendEmail({
//                 email: application.parentInfo.email,
//                 subject: 'Create Parent Account - Clarenest International School',
//                 html: `
//                     <h1>Welcome to Clarenest International School</h1>
//                     <p>Dear ${application.parentInfo.name},</p>
//                     <p>Your child's application has been approved.</p>
//                     <p>Please create your parent account by clicking the button below:</p>
//                     <a href="${parentURL}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
//                         Create Parent Account
//                     </a>
//                     <p>This link will expire in 24 hours.</p>
//                     <p>If the button doesn't work, copy and paste this URL into your browser:</p>
//                     <p>${parentURL}</p>
//                 `
//             });

//         } catch (emailError) {
//             console.error('Error sending approval emails:', emailError);
//             application.status = 'pending';
//             application.accountCreationToken = undefined;
//             application.accountCreationTokenExpires = undefined;
//             application.parentAccountCreationToken = undefined;
//             application.parentAccountCreationTokenExpires = undefined;
//             await application.save();
//             return next(new AppError('Error sending approval emails. Please try again.', 500));
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Application approved. Account creation instructions sent to both student and parent.'
//         });
//     } catch (err) {
//         console.error('Error in approveStudentApplication:', err);
//         next(new AppError('Error approving application: ' + err.message, 500));
//     }
// };


exports.approveStudentApplication = async (req, res, next) => {
    try {
        const application = await StudentApplication.findById(req.params.id);
        if (!application) {
            return next(new AppError('Student application not found', 404));
        }

        if (application.status !== 'pending') {
            return next(new AppError('Application has already been processed', 400));
        }

        // Generate tokens for both student and parent
        const studentTokens = createToken();
        const parentTokens = createToken();

        // Update application status and set student token
        application.status = 'approved';
        application.accountCreationToken = studentTokens.hashedToken;
        application.accountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

        // Store parent token in application
        application.parentAccountCreationToken = parentTokens.hashedToken;
        application.parentAccountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

        // Validate email addresses before sending
        if (!application.personalInfo.email) {
            return next(new AppError('Student email is missing', 400));
        }

        if (!application.parentInfo.email) {
            return next(new AppError('Parent email is missing', 400));
        }

        try {
            await application.save();

            // Send student account creation email
            const studentURL = `${process.env.FRONTEND_URL}/create-account/student/${studentTokens.rawToken}`;
            await sendEmail({
                email: application.personalInfo.email,
                subject: 'Student Application Approved - Create Your Account',
                html: `
                    <h1>Application Approved!</h1>
                    <p>Dear ${application.personalInfo.fullName},</p>
                    <p>Your application to Clarenest International School has been approved.</p>
                    <p>Please create your student account by clicking the button below:</p>
                    <a href="${studentURL}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                        Create Student Account
                    </a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p>${studentURL}</p>
                `
            });

            // Send parent account creation email
            const parentURL = `${process.env.FRONTEND_URL}/create-account/parent/${parentTokens.rawToken}`;
            await sendEmail({
                email: application.parentInfo.email,
                subject: 'Create Parent Account - Clarenest International School',
                html: `
                    <h1>Welcome to Clarenest International School</h1>
                    <p>Dear ${application.parentInfo.name},</p>
                    <p>Your child's application has been approved.</p>
                    <p>Please create your parent account by clicking the button below:</p>
                    <a href="${parentURL}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                        Create Parent Account
                    </a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p>${parentURL}</p>
                `
            });

        } catch (emailError) {
            console.error('Error sending approval emails:', emailError);
            application.status = 'pending';
            application.accountCreationToken = undefined;
            application.accountCreationTokenExpires = undefined;
            application.parentAccountCreationToken = undefined;
            application.parentAccountCreationTokenExpires = undefined;
            await application.save();
            return next(new AppError('Error sending approval emails. Please try again.', 500));
        }

        res.status(200).json({
            status: 'success',
            message: 'Application approved. Account creation instructions sent to both student and parent.'
        });
    } catch (err) {
        console.error('Error in approveStudentApplication:', err);
        next(new AppError('Error approving application: ' + err.message, 500));
    }
};

exports.createStudentAccount = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const application = await StudentApplication.findOne({
            accountCreationToken: hashedToken,
            accountCreationTokenExpires: { $gt: Date.now() }
        });

        if (!application) {
            return next(new AppError('Invalid or expired token', 400));
        }

        // Check for existing user
        const existingUser = await User.findOne({ 
            email: application.personalInfo.email 
        });

        if (existingUser) {
            return next(new AppError('An account with this email already exists', 400));
        }

        // Create new student
        const newStudent = await Student.create({
            name: application.personalInfo.fullName,
            email: application.personalInfo.email,
            password: req.body.password,
            role: 'student',
            grade: application.educationalInfo.currentGradeLevel,
            status: 'offline',
            isEmailVerified: true,
            enrollmentDate: new Date(),
            lastActive: new Date()
        });

        // Automatically enroll student in subjects for their grade
        await enrollStudentInGradeSubjects(
            newStudent._id, 
            application.educationalInfo.currentGradeLevel
        );

        // Update application
        application.status = 'account_created';
        application.accountCreationToken = undefined;
        application.accountCreationTokenExpires = undefined;
        await application.save();

        // Generate token for immediate login
        const token = jwt.sign(
            { id: newStudent._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: newStudent._id,
                    name: newStudent.name,
                    email: newStudent.email,
                    role: newStudent.role,
                    grade: newStudent.grade
                },
                token
            }
        });
    } catch (err) {
        console.error('Error creating student account:', err);
        next(new AppError('Error creating account: ' + err.message, 500));
    }
};
exports.submitTutorApplication = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return next(new AppError('No files were uploaded', 400));
        }

        const filesValidation = validateTutorFiles(req.files);
        if (filesValidation.error) {
            return next(new AppError(filesValidation.error.details[0].message, 400));
        }

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

        const existingApplication = await TutorApplication.findOne({
            'personalInfo.email': applicationData.personalInfo.email,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingApplication) {
            return next(new AppError('An application with this email already exists', 400));
        }

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

        await sendEmail({
            email: applicationData.personalInfo.email,
            subject: 'Tutor Application Received',
            html: `
                <h1>Application Received</h1>
                <p>Dear ${applicationData.personalInfo.fullName},</p>
                <p>Your tutor application has been received and is under review.</p>
                <p>We will contact you once the review process is complete.</p>
                <p>Thank you for your interest in joining Clarenest International School.</p>
            `
        });

        res.status(201).json({
            status: 'success',
            message: 'Application submitted successfully. We will review your application and contact you soon.',
            data: {
                applicationId: newApplication._id
            }
        });
    } catch (err) {
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
        const application = await TutorApplication.findById(req.params.id)
            
        if (!application) {
            return next(new AppError('Tutor application not found', 404));
        }

        if (application.status !== 'pending') {
            return next(new AppError('Application has already been processed', 400));
        }

        // Generate token
        const { rawToken, hashedToken } = createToken();
        
        // Update application
        application.status = 'approved';
        application.accountCreationToken = hashedToken;
        application.accountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

        // Validate email before sending
        if (!application.personalInfo.email) {
            return next(new AppError('Tutor email is missing', 400));
        }

        try {
            await application.save();

            // Send account creation email
            const accountCreationURL = `${process.env.FRONTEND_URL}/create-account/tutor/${rawToken}`;
            await sendEmail({
                email: application.personalInfo.email,
                subject: 'Tutor Application Approved - Create Your Account',
                html: `
                    <h1>Application Approved!</h1>
                    <p>Dear ${application.personalInfo.fullName},</p>
                    <p>Your tutor application has been approved.</p>
                    <p>Please create your account by clicking the button below:</p>
                    <a href="${accountCreationURL}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                        Create Tutor Account
                    </a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p>${accountCreationURL}</p>
                `
            });

        } catch (emailError) {
            console.error('Error sending approval email:', emailError);
            application.status = 'pending';
            application.accountCreationToken = undefined;
            application.accountCreationTokenExpires = undefined;
            await application.save();
            return next(new AppError('Error sending approval email. Please try again.', 500));
        }

        res.status(200).json({
            status: 'success',
            message: 'Tutor application approved. An invitation to create an account has been sent to the applicant.'
        });
    } catch (err) {
        console.error('Error in approveTutorApplication:', err);
        next(new AppError(`Error approving application: ${err.message}`, 500));
    }
};

// exports.createTutorAccount = async (req, res, next) => {
//     try {
//         console.log('Creating tutor account with token:', req.params.token);
        
//         const hashedToken = crypto
//             .createHash('sha256')
//             .update(req.params.token)
//             .digest('hex');

//         const application = await TutorApplication.findOne({
//             accountCreationToken: hashedToken,
//             accountCreationTokenExpires: { $gt: Date.now() }
//         });

//         if (!application) {
//             return next(new AppError('Invalid or expired token', 400));
//         }

//         // Check for existing user
//         const existingUser = await User.findOne({ 
//             email: application.personalInfo.email 
//         });

//         if (existingUser) {
//             return next(new AppError('An account with this email already exists', 400));
//         }

//         // Format qualifications properly
//         const formattedQualifications = application.professionalInfo.academicQualifications.map(qual => ({
//             degree: qual,
//             institution: 'Not Specified',
//             year: new Date().getFullYear()
//         }));

//         // Create new tutor
//         const newTutor = await Tutor.create({
//             name: application.personalInfo.fullName,
//             email: application.personalInfo.email,
//             password: req.body.password,
//             role: 'tutor',
//             subjects: application.professionalInfo.subjectsSpecialization,
//             qualifications: formattedQualifications,  // Using formatted qualifications
//             yearsOfExperience: application.professionalInfo.teachingExperience || 0,
//             preferredGradeLevels: application.professionalInfo.preferredGradeLevels || [],
//             status: 'offline',  // Changed from 'active' to 'offline'
//             isEmailVerified: true,
//             lastActive: new Date()
//         });

//         // Update application
//         application.status = 'account_created';
//         application.accountCreationToken = undefined;
//         application.accountCreationTokenExpires = undefined;
//         await application.save();

//         // Generate token for immediate login
//         const token = jwt.sign(
//             { id: newTutor._id },
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRES_IN }
//         );

//         res.status(201).json({
//             status: 'success',
//             message: 'Tutor account created successfully',
//             data: {
//                 user: {
//                     id: newTutor._id,
//                     name: newTutor.name,
//                     email: newTutor.email,
//                     role: newTutor.role,
//                     subjects: newTutor.subjects,
//                     status: newTutor.status
//                 },
//                 token
//             }
//         });
//     } catch (err) {
//         console.error('Error creating tutor account:', err);
//         next(new AppError('Error creating account: ' + err.message, 500));
//     }
// };

exports.createTutorAccount = async (req, res, next) => {
    try {
        console.log('Creating tutor account with token:', req.params.token);
        
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const application = await TutorApplication.findOne({
            accountCreationToken: hashedToken,
            accountCreationTokenExpires: { $gt: Date.now() },
            status: 'approved'  
        });

        if (!application) {
            return next(new AppError('Invalid or expired token', 400));
        }

        // Check for existing user
        const existingUser = await User.findOne({ 
            email: application.personalInfo.email 
        });

        if (existingUser) {
            return next(new AppError('An account with this email already exists', 400));
        }

        // Format qualifications properly
        const formattedQualifications = application.professionalInfo.academicQualifications.map(qual => ({
            degree: qual,
            institution: 'Not Specified',
            year: new Date().getFullYear()
        }));

        // Create new tutor
        const newTutor = await Tutor.create({
            name: application.personalInfo.fullName,
            email: application.personalInfo.email,
            password: req.body.password,
            role: 'tutor',
            subjects: application.professionalInfo.subjectsSpecialization,
            qualifications: formattedQualifications,
            yearsOfExperience: application.professionalInfo.teachingExperience || 0,
            preferredGradeLevels: application.professionalInfo.preferredGradeLevels || [],
            status: 'offline',
            isEmailVerified: true,
            lastActive: new Date()
        });

        // Update application
        application.status = 'account_created';
        application.accountCreationToken = undefined;
        application.accountCreationTokenExpires = undefined;
        await application.save();

        // Generate token for immediate login
        const token = jwt.sign(
            { id: newTutor._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            status: 'success',
            message: 'Tutor account created successfully',
            data: {
                user: {
                    id: newTutor._id,
                    name: newTutor.name,
                    email: newTutor.email,
                    role: newTutor.role,
                    subjects: newTutor.subjects,
                    status: newTutor.status
                },
                token
            }
        });
    } catch (err) {
        console.error('Error creating tutor account:', err);
        next(new AppError('Error creating account: ' + err.message, 500));
    }
};

exports.getAllApplications = async (req, res, next) => {
    try {
        const [studentApplications, tutorApplications] = await Promise.all([
            StudentApplication.find(),
            TutorApplication.find()
        ]);
        
        res.status(200).json({
            status: 'success',
            data: {
                studentApplications,
                tutorApplications,
                totalApplications: studentApplications.length + tutorApplications.length
            }
        });
    } catch (err) {
        next(new AppError('Error fetching applications: ' + err.message, 500));
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
            return next(new AppError('Invalid application type. Must be either "student" or "tutor"', 400));
        }

        if (!application) {
            return next(new AppError(`${type.charAt(0).toUpperCase() + type.slice(1)} application not found`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                applicationType: type,
                application
            }
        });
    } catch (err) {
        next(new AppError('Error fetching application: ' + err.message, 500));
    }
};

exports.updateApplication = async (req, res, next) => {
    try {
        const { id, type } = req.params;
        let application;

        // Validate update data based on application type
        if (type === 'student') {
            const { error } = validateStudentApplication(req.body);
            if (error) {
                return next(new AppError(error.details[0].message, 400));
            }
        } else if (type === 'tutor') {
            const { error } = validateTutorApplication(req.body);
            if (error) {
                return next(new AppError(error.details[0].message, 400));
            }
        } else {
            return next(new AppError('Invalid application type', 400));
        }

        // Update the application
        const Model = type === 'student' ? StudentApplication : TutorApplication;
        application = await Model.findByIdAndUpdate(
            id,
            { $set: req.body },
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

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
        next(new AppError('Error updating application: ' + err.message, 500));
    }
};

exports.rejectApplication = async (req, res, next) => {
    try {
        const { id, type } = req.params;
        let application;

        if (type === 'student') {
            application = await StudentApplication.findByIdAndUpdate(
                id,
                { 
                    status: 'rejected',
                    rejectionReason: req.body.reason || 'Application does not meet our current requirements.',
                    rejectedAt: new Date()
                },
                { new: true }
            );
        } else if (type === 'tutor') {
            application = await TutorApplication.findByIdAndUpdate(
                id,
                { 
                    status: 'rejected',
                    rejectionReason: req.body.reason || 'Application does not meet our current requirements.',
                    rejectedAt: new Date()
                },
                { new: true }
            );
        } else {
            return next(new AppError('Invalid application type', 400));
        }

        if (!application) {
            return next(new AppError('Application not found', 404));
        }

        // Send rejection email with custom reason if provided
        await sendEmail({
            email: application.personalInfo.email,
            subject: 'Application Status Update - Clarenest International School',
            html: `
                <h1>Application Status Update</h1>
                <p>Dear ${application.personalInfo.fullName},</p>
                <p>We regret to inform you that your application to Clarenest International School has not been accepted at this time.</p>
                ${req.body.reason ? `<p>Reason: ${req.body.reason}</p>` : ''}
                <p>Thank you for your interest in joining our institution.</p>
                <p>Best regards,<br>Clarenest International School</p>
            `
        });

        res.status(200).json({
            status: 'success',
            message: 'Application rejected successfully.',
            data: {
                application
            }
        });
    } catch (err) {
        next(new AppError('Error rejecting application: ' + err.message, 500));
    }
};

module.exports = exports;