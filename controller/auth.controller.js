const mongoose = require('mongoose');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const Parent = require('../models/parent.model');
const TutorApplication = require('../models/tutorApplication.model');
const StudentApplication = require('../models/studentApplication.model');
const Admin = require('../models/admin.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email.util');
const AppError = require('../utils/appError');
const { retry } = require('../utils/database.util');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createToken = () => {
    // Generate raw token for email URL
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Generate hashed version for database
    const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
    
    return { rawToken, hashedToken };
};



exports.registerAdmin = async (req, res, next) => {
    try {
        const { adminSecretKey } = req.body;
        
        if (!process.env.ADMIN_SECRET_KEY || adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
            return next(new AppError('Unauthorized admin registration attempt', 401));
        }

        const { 
            name, 
            email, 
            password, 
            department, 
            adminLevel, 
            permissions 
        } = req.body;

        const existingUser = await User.findOne({ email }).select('+isEmailVerified');
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }

        const newAdmin = await Admin.create({
            name,
            email,
            password,
            role: 'admin',
            department,
            adminLevel,
            permissions: permissions || ['manage_users', 'manage_courses'],
            status: 'active',
            isEmailVerified: true
        });

        const token = signToken(newAdmin._id);

        res.status(201).json({
            status: 'success',
            message: 'Admin account created successfully',
            data: {
                user: {
                    id: newAdmin._id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    role: newAdmin.role,
                    department: newAdmin.department,
                    adminLevel: newAdmin.adminLevel,
                    permissions: newAdmin.permissions
                },
                token
            }
        });

    } catch (err) {
        console.error('Admin registration error:', err);
        return next(new AppError(err.message || 'Error during admin registration', 500));
    }
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, ...additionalData } = req.body;

        if (mongoose.connection.readyState !== 1) {
            return next(new AppError('Database connection not ready', 500));
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // If user exists but unverified, delete and allow re-registration
            if (!existingUser.isEmailVerified && !existingUser.verificationToken) {
                await User.deleteOne({ _id: existingUser._id });
            } else {
                return next(new AppError('Email already in use', 400));
            }
        }

        let newUser;

        // Handle user creation based on role
        switch (role.toLowerCase()) {
            case 'student':
                newUser = new Student({
                    name,
                    email,
                    password,
                    role: 'student',
                    grade: additionalData.grade || '10th', // Set a default grade if not provided
                    subjects: additionalData.subjects || [],
                    parent: additionalData.parentId || null,
                    status: 'active',
                    isEmailVerified: true,
                    enrollmentDate: new Date()
                });

                if (additionalData.application) {
                    await StudentApplication.create({
                        user: newUser._id,
                        ...additionalData.application,
                        status: 'active'
                    });
                }
                break;

            case 'tutor':
                newUser = new Tutor({
                    name,
                    email,
                    password,
                    role: 'tutor',
                    subjects: additionalData.subjects || [],
                    qualifications: additionalData.qualifications || [],
                    yearsOfExperience: additionalData.yearsOfExperience || 0,
                    preferredGradeLevels: additionalData.preferredGradeLevels || [],
                    availability: additionalData.availability || [],
                    status: 'active',
                    isEmailVerified: true
                });

                if (additionalData.application) {
                    await TutorApplication.create({
                        user: newUser._id,
                        ...additionalData.application,
                        status: 'active'
                    });
                }
                break;

            case 'parent':
                newUser = new Parent({
                    name,
                    email,
                    password,
                    role: 'parent',
                    children: additionalData.children || [],
                    relationship: additionalData.relationship || 'Parent',
                    emergencyContact: additionalData.emergencyContact || {},
                    status: 'active',
                    isEmailVerified: true
                });

                if (additionalData.children?.length > 0) {
                    await Student.updateMany(
                        { _id: { $in: additionalData.children } },
                        { $set: { parent: newUser._id } }
                    );
                }
                break;

            case 'admin':
                if (additionalData.adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
                    return next(new AppError('Invalid admin secret key', 403));
                }
                newUser = new Admin({
                    name,
                    email,
                    password,
                    role: 'admin',
                    department: additionalData.department || 'Academic Affairs',
                    adminLevel: additionalData.adminLevel || 'Junior',
                    permissions: additionalData.permissions || ['manage_users', 'manage_courses'],
                    status: 'active',
                    isEmailVerified: true
                });
                break;

            default:
                return next(new AppError('Invalid user role', 400));
        }

        // Save the new user
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Send response
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    status: newUser.status
                }
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        
        if (err.name === 'MongoTimeoutError') {
            return next(new AppError('Database operation timed out. Please try again.', 500));
        }
        
        if (err.name === 'MongoNetworkError') {
            return next(new AppError('Database connection error. Please try again.', 500));
        }

        if (err.code === 11000) {
            return next(new AppError('Email already registered. Please use a different email.', 400));
        }
        
        next(new AppError(err.message || 'Error during registration', 500));
    }
};

// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         // Check if email and password exist
//         if (!email || !password) {
//             return next(new AppError('Please provide email and password', 400));
//         }

//         // Find user and include password field
//         const baseUser = await User.findOne({ email }).select('+password');

//         if (!baseUser || !(await baseUser.correctPassword(password, baseUser.password))) {
//             return next(new AppError('Incorrect email or password', 401));
//         }

//         // Get the full user document from the appropriate model based on role
//         let fullUser;
//         switch (baseUser.role) {
//             case 'student':
//                 fullUser = await Student.findById(baseUser._id);
//                 break;
//             case 'tutor':
//                 fullUser = await Tutor.findById(baseUser._id);
//                 break;
//             case 'parent':
//                 fullUser = await Parent.findById(baseUser._id);
//                 break;
//             case 'admin':
//                 fullUser = await Admin.findById(baseUser._id);
//                 break;
//             default:
//                 fullUser = baseUser;
//         }

//         if (!fullUser) {
//             return next(new AppError(`${baseUser.role} account not found`, 404));
//         }

//         // Create token
//         const token = signToken(fullUser._id);

//         // Update last active timestamp
//         fullUser.lastActive = new Date();
//         await fullUser.save({ validateBeforeSave: false });

//         // Send response
//         res.status(200).json({
//             status: 'success',
//             token,
//             data: {
//                 user: {
//                     id: fullUser._id,
//                     name: fullUser.name,
//                     email: fullUser.email,
//                     role: fullUser.role,
//                     status: fullUser.status
//                 }
//             }
//         });
//     } catch (err) {
//         console.error('Login error:', err);
//         next(new AppError('Error during login', 500));
//     }
// };

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        // Find user and include password field
        const baseUser = await User.findOne({ email }).select('+password');

        if (!baseUser || !(await baseUser.correctPassword(password, baseUser.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // Get the user document from the appropriate model based on role
        let user;
        try {
            switch (baseUser.role) {
                case 'student':
                    user = await Student.findById(baseUser._id);
                    break;
                case 'tutor':
                    user = await Tutor.findById(baseUser._id);
                    break;
                case 'parent':
                    user = await Parent.findById(baseUser._id);
                    break;
                case 'admin':
                    user = await Admin.findById(baseUser._id);
                    break;
                default:
                    return next(new AppError('Invalid user role', 400));
            }

            if (!user) {
                return next(new AppError(`${baseUser.role} account not found`, 404));
            }
        } catch (error) {
            console.error('Error finding user by role:', error);
            return next(new AppError('Error finding user account', 500));
        }

        // Create token
        const token = signToken(user._id);

        await User.findByIdAndUpdate(user._id, { 
            status: 'online',
            lastActive: new Date()
          });
        await user.save({ validateBeforeSave: false });

        // Send response
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    // Include grade for students
                    ...(user.role === 'student' && { grade: user.grade }),
                    // Include subjects for tutors
                    ...(user.role === 'tutor' && { subjects: user.subjects })
                }
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        next(new AppError('Error during login', 500));
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        status: 'online',
        lastActive: new Date()
      });
      
      res.status(200).json({ status: 'success' });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  };

exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email })
            .select('+resetPasswordToken +resetPasswordExpire');
            
        if (!user) {
            return next(new AppError('No user found with that email address', 404));
        }

        const { rawToken, hashedToken } = createToken();
        
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <a href="${resetURL}" 
                   style="display: inline-block; padding: 10px 20px; 
                          background-color: #4CAF50; color: white; 
                          text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 10 minutes.</p>
            `
        });

        res.status(200).json({
            status: 'success',
            message: 'Password reset instructions sent to email'
        });
    } catch (err) {
        console.error('Password reset error:', err);
        next(new AppError('Error sending password reset email', 500));
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            return next(new AppError('Invalid or expired reset token', 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            message: 'Password reset successful'
        });
    } catch (err) {
        console.error('Password reset error:', err);
        next(new AppError('Error resetting password', 500));
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        next(new AppError('Error fetching profile', 500));
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const allowedUpdates = ['name', 'email', 'phoneNumber'];
        const updates = Object.keys(req.body)
            .filter(update => allowedUpdates.includes(update));
        
        if (updates.length === 0) {
            return next(new AppError('No valid update fields provided', 400));
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates.reduce((obj, key) => ({ ...obj, [key]: req.body[key] }), {}) },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: { user: updatedUser }
        });
    } catch (err) {
        next(new AppError('Error updating profile', 400));
    }
};

module.exports = exports;