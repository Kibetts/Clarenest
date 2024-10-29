
const User = require('../models/user.model');
const TutorApplication = require('../models/tutorApplication.model');
const StudentApplication = require('../models/studentApplication.model');
const Admin = require('../models/admin.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email.util');
const AppError = require('../utils/appError');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, ...additionalData } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }

        let newUser;

        // Handle user creation based on role
        switch (role) {
            case 'admin':
                newUser = await Admin.create({
                    name,
                    email,
                    password,
                    role,
                    department: additionalData.department || 'Academic Affairs',
                    adminLevel: additionalData.adminLevel || 'Junior',
                    permissions: additionalData.permissions || ['manage_users', 'manage_courses'],
                    status: 'active',
                    isEmailVerified: true // Admins are verified by default
                });
                break;

            case 'tutor':
                newUser = await Tutor.create({
                    name,
                    email,
                    password,
                    role,
                    subjects: additionalData.subjects || [],
                    qualifications: additionalData.qualifications || [],
                    yearsOfExperience: additionalData.yearsOfExperience || 0,
                    preferredGradeLevels: additionalData.preferredGradeLevels || [],
                    availability: additionalData.availability || [],
                    status: 'pending',
                    isEmailVerified: false
                });

                // Create tutor application
                if (additionalData.application) {
                    await TutorApplication.create({
                        user: newUser._id,
                        ...additionalData.application,
                        status: 'pending'
                    });
                }
                break;

            case 'student':
                newUser = await Student.create({
                    name,
                    email,
                    password,
                    role,
                    grade: additionalData.grade,
                    subjects: additionalData.subjects || [],
                    parent: additionalData.parentId || null,
                    status: 'pending',
                    isEmailVerified: false,
                    enrollmentDate: new Date()
                });

                // Create student application
                if (additionalData.application) {
                    await StudentApplication.create({
                        user: newUser._id,
                        ...additionalData.application,
                        status: 'pending'
                    });
                }
                break;

            case 'parent':
                newUser = await Parent.create({
                    name,
                    email,
                    password,
                    role,
                    children: additionalData.children || [],
                    relationship: additionalData.relationship,
                    emergencyContact: additionalData.emergencyContact,
                    status: 'pending',
                    isEmailVerified: false
                });

                // Update children's parent reference if provided
                if (additionalData.children && additionalData.children.length > 0) {
                    await Student.updateMany(
                        { _id: { $in: additionalData.children } },
                        { $set: { parent: newUser._id } }
                    );
                }
                break;

            default:
                return next(new AppError('Invalid user role', 400));
        }

        // Generate verification token (except for admin)
        if (role !== 'admin') {
            const verificationToken = crypto.randomBytes(32).toString('hex');
            newUser.verificationToken = crypto
                .createHash('sha256')
                .update(verificationToken)
                .digest('hex');
            newUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            await newUser.save({ validateBeforeSave: false });

            // Send verification email
            const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
            const message = `Please verify your email by clicking on the following link: ${verificationURL}`;

            try {
                await sendEmail({
                    email: newUser.email,
                    subject: 'Email Verification',
                    message,
                    html: `
                        <h1>Welcome to Clarenest International School</h1>
                        <p>Thank you for registering with us. Please verify your email to continue.</p>
                        <p>Click the link below to verify your email:</p>
                        <a href="${verificationURL}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                            Verify Email
                        </a>
                        <p>If the button doesn't work, copy and paste this link in your browser:</p>
                        <p>${verificationURL}</p>
                        <p>This link will expire in 24 hours.</p>
                    `
                });
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
                newUser.verificationToken = undefined;
                newUser.verificationTokenExpires = undefined;
                await newUser.save({ validateBeforeSave: false });
                return next(new AppError('There was an error sending the email. Try again later!', 500));
            }
        }

        // Send role-specific welcome emails
        let welcomeMessage;
        switch (role) {
            case 'tutor':
                welcomeMessage = 'Welcome to our teaching team! Your application is being reviewed.';
                break;
            case 'student':
                welcomeMessage = 'Welcome to Clarenest! We\'re excited to have you join our learning community.';
                break;
            case 'parent':
                welcomeMessage = 'Welcome to Clarenest! Stay connected with your child\'s education journey.';
                break;
            default:
                welcomeMessage = 'Welcome to Clarenest International School!';
        }

        // Return success response
        res.status(201).json({
            status: 'success',
            message: role === 'admin' 
                ? 'Admin account created successfully' 
                : 'Registration successful. Please check your email to verify your account.',
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        next(new AppError(err.message || 'Error during registration', 500));
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

        // Use the model method
        user.verifyEmail();
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (err) {
        next(new AppError('Error verifying email', 500));
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        if (!user.isEmailVerified) {
            return next(new AppError('Please verify your email before logging in', 401));
        }

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (err) {
        next(err);
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email address' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500).json({
            status: 'error',
            message: 'There was an error sending the email. Try again later!'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await req.user.constructor.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const allowedUpdates = ['name', 'email', 'phoneNumber'];
        const updates = Object.keys(req.body).filter(update => allowedUpdates.includes(update));
        
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        res.json({ message: 'Profile updated successfully', user: req.user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
