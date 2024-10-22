
// const User = require('../models/user.model');
// const TutorApplication = require('../models/tutorApplication.model');
// const StudentApplication = require('../models/studentApplication.model');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const sendEmail = require('../utils/email.util');
// const AppError = require('../utils/appError');

// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN
//     });
// };

// exports.register = async (req, res, next) => {
//     try {
//         const { name, email, password, role } = req.body;

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return next(new AppError('Email already in use', 400));
//         }

//         // Create a new user with pending status
//         const newUser = await User.create({
//             name,
//             email,
//             password,
//             role,
//             status: 'active', // return to pending
//             isEmailVerified: true 
//         });

//         // Generate verification token
//         const verificationToken = crypto.randomBytes(32).toString('hex');
//         newUser.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
//         newUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
//         await newUser.save({ validateBeforeSave: false });

//         // Send verification email
//         // const verificationURL = `${req.protocol}://${req.get('host')}/api/verify-email/${verificationToken}`;
//         // const message = `Please verify your email by clicking on the following link: ${verificationURL}`;
        
//         console.log('Verification URL:', verificationURL);

//         const message = `Please verify your email by clicking on the following link: ${verificationURL}`;
//         console.log('Email message:', message);

//         await sendEmail({
//             email: newUser.email,
//             subject: 'Email Verification',
//             message
//         });

//         try {
//             await sendEmail({
//                 email: newUser.email,
//                 subject: 'Email Verification',
//                 message
//             });
//             console.log('Verification email sent successfully');
//         } catch (emailError) {
//             console.error('Error sending verification email:', emailError);
//             newUser.verificationToken = undefined;
//             newUser.verificationTokenExpires = undefined;
//             await newUser.save({ validateBeforeSave: false });
//             return next(new AppError('There was an error sending the email. Try again later!', 500));
//         }


//         // Create application based on role
//         if (role === 'tutor') {
//             await TutorApplication.create({ user: newUser._id, ...req.body.application });
//         } else if (role === 'student') {
//             await StudentApplication.create({ user: newUser._id, ...req.body.application });
//         }

//         res.status(201).json({
//             status: 'success',
//             message: 'User registered successfully. Please check your email to verify your account.'
//         });
//     } catch (err) {
//         next(err);
//     }
// };

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

//         user.status = 'verified';
//         user.verificationToken = undefined;
//         user.verificationTokenExpires = undefined;
//         await user.save({ validateBeforeSave: false });

//         res.status(200).json({
//             status: 'success',
//             message: 'Email verified successfully. You can now log in.'
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return next(new AppError('Please provide email and password', 400));
//         }

//         const user = await User.findOne({ email }).select('+password');

//         if (!user || !(await user.correctPassword(password, user.password))) {
//             return next(new AppError('Incorrect email or password', 401));
//         }

//         // if (user.status === 'pending') {
//         //     return next(new AppError('Please verify your email before logging in', 401));
//         // }
//         if (!user.isEmailVerified) {
//             return next(new AppError('Please verify your email before logging in', 401));
//           }

//         if (user.isFirstLogin) {
//             // Generate OTP for first-time login
//             const otp = Math.floor(100000 + Math.random() * 900000).toString();
//             user.otp = otp;
//             user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//             await user.save({ validateBeforeSave: false });

//             // Send OTP to user's email
//             await sendEmail({
//                 email: user.email,
//                 subject: 'One-Time Password for First Login',
//                 message: `Your OTP for first-time login is: ${otp}`
//             });

//             return res.status(200).json({
//                 status: 'success',
//                 message: 'OTP sent to your email for first-time login'
//             });
//         }

//         const token = signToken(user._id);

//         res.status(200).json({
//             status: 'success',
//             token,
//             data: {
//                 user: {
//                     id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     role: user.role
//                 }
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// exports.verifyEmail = async (req, res, next) => {
//     const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
//     const user = await User.findOne({
//       verificationToken: hashedToken,
//       verificationTokenExpires: { $gt: Date.now() }
//     });
  
//     if (!user) {
//       return next(new AppError('Token is invalid or has expired', 400));
//     }
  
//     user.isEmailVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpires = undefined; // TODO
//     await user.save({ validateBeforeSave: false });
  
//     res.status(200).json({
//       status: 'success',
//       message: 'Email verified successfully. You can now log in.'
//     });
//   };

// exports.verifyOTP = async (req, res, next) => {
//     try {
//         const { email, otp } = req.body;

//         const user = await User.findOne({ 
//             email, 
//             otp,
//             otpExpires: { $gt: Date.now() }
//         });

//         if (!user) {
//             return next(new AppError('Invalid or expired OTP', 400));
//         }

//         user.isFirstLogin = false;
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         await user.save({ validateBeforeSave: false });

//         const token = signToken(user._id);

//         res.status(200).json({
//             status: 'success',
//             token,
//             data: {
//                 user: {
//                     id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     role: user.role
//                 }
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// exports.forgotPassword = async (req, res) => {
//     try {
//         const user = await User.findOne({ email: req.body.email });
//         if (!user) {
//             return res.status(404).json({ message: 'There is no user with that email address' });
//         }

//         const resetToken = crypto.randomBytes(32).toString('hex');
//         user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//         user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

//         await user.save({ validateBeforeSave: false });

//         const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
//         const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

//         await sendEmail({
//             email: user.email,
//             subject: 'Your password reset token (valid for 10 min)',
//             message
//         });

//         res.status(200).json({
//             status: 'success',
//             message: 'Token sent to email!'
//         });
//     } catch (err) {
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;
//         await user.save({ validateBeforeSave: false });

//         res.status(500).json({
//             status: 'error',
//             message: 'There was an error sending the email. Try again later!'
//         });
//     }
// };

// exports.getProfile = async (req, res) => {
//     try {
//         const user = await req.user.constructor.findById(req.user.id).select('-password');
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.updateProfile = async (req, res) => {
//     try {
//         const allowedUpdates = ['name', 'email', 'phoneNumber'];
//         const updates = Object.keys(req.body).filter(update => allowedUpdates.includes(update));
        
//         updates.forEach(update => req.user[update] = req.body[update]);
//         await req.user.save();

//         res.json({ message: 'Profile updated successfully', user: req.user });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

// exports.resetPassword = async (req, res) => {
//     try {
//         const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

//         const user = await User.findOne({
//             resetPasswordToken: hashedToken,
//             resetPasswordExpire: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({ message: 'Token is invalid or has expired' });
//         }

//         user.password = req.body.password;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;
//         await user.save();

//         const token = signToken(user._id);

//         res.status(200).json({
//             status: 'success',
//             token
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

const User = require('../models/user.model');
const TutorApplication = require('../models/tutorApplication.model');
const StudentApplication = require('../models/studentApplication.model');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }

        // Create a new user with active status and verified email
        const newUser = await User.create({
            name,
            email,
            password,
            role,
            status: 'active',
            isEmailVerified: true
        });

        // Create application based on role
        if (role === 'tutor') {
            await TutorApplication.create({ user: newUser._id, ...req.body.application });
        } else if (role === 'student') {
            await StudentApplication.create({ user: newUser._id, ...req.body.application });
        }

        // Generate token for the new user
        const token = signToken(newUser._id);

        res.status(201).json({
            status: 'success',
            token,
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
        next(err);
    }
};

// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return next(new AppError('Please provide email and password', 400));
//         }

//         const user = await User.findOne({ email }).select('+password');

//         if (!user || !(await user.correctPassword(password, user.password))) {
//             return next(new AppError('Incorrect email or password', 401));
//         }

//         const token = signToken(user._id);

//         res.status(200).json({
//             status: 'success',
//             token,
//             data: {
//                 user: {
//                     id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     role: user.role
//                 }
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return next(new AppError('Please provide email and password', 400));
//         }

//         const user = await User.findOne({ email }).select('+password');

//         if (!user || !(await user.correctPassword(password, user.password))) {
//             return next(new AppError('Incorrect email or password', 401));
//         }

//         if (!user.isEmailVerified) {
//             return next(new AppError('Please verify your email before logging in', 401));
//         }

//         const token = signToken(user._id);

//         // Remove password from output
//         user.password = undefined;

//         res.status(200).json({
//             status: 'success',
//             token,
//             data: {
//                 user: {
//                     id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     role: user.role
//                 }
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// };

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email, password: '********' });

        if (!email || !password) {
            console.log('Missing email or password');
            return next(new AppError('Please provide email and password', 400));
        }

        const user = await User.findOne({ email }).select('+password');
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user || !(await user.correctPassword(password, user.password))) {
            console.log('Invalid credentials');
            return next(new AppError('Incorrect email or password', 401));
        }

        if (!user.isEmailVerified) {
            console.log('Email not verified');
            return next(new AppError('Please verify your email before logging in', 401));
        }

        const token = signToken(user._id);
        console.log('Login successful');

        // Remove password from output
        user.password = undefined;

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
        console.error('Login error:', err);
        next(err);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
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
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    // Implement password reset logic here if needed
    res.status(501).json({ message: 'Password reset functionality not implemented' });
};

exports.resetPassword = async (req, res) => {
    // Implement password reset logic here if needed
    res.status(501).json({ message: 'Password reset functionality not implemented' });
};

module.exports = exports;