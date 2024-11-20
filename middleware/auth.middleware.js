const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');

exports.authenticateJWT = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                status: 'error',
                message: 'No token provided. Please log in.',
                code: 'NO_TOKEN'
            });
        }

        try {
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            const currentUser = await User.findById(decoded.id);
            
            if (!currentUser) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User no longer exists',
                    code: 'USER_NOT_FOUND'
                });
            }

            req.user = currentUser;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token has expired. Please log in again.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            throw err;
        }
    } catch (err) {
        console.error('JWT authentication error:', err);
        res.status(401).json({ 
            status: 'error',
            message: 'Invalid token. Please log in again.',
            code: 'INVALID_TOKEN'
        });
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};

exports.requireEmailVerification = (req, res, next) => {
    if (!req.user.isEmailVerified) {
      return next(new AppError('Please verify your email to access this resource', 403));
    }
    next();
};

// exports.auth = async (req, res, next) => {
//     try {
//         // Get token from header
//         const token = req.headers.authorization?.split(' ')[1];
        
//         if (!token) {
//             return res.status(401).json({
//                 status: 'fail',
//                 message: 'No auth token provided'
//             });
//         }

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
//         // Find user
//         const user = await User.findById(decoded.id);
//         if (!user) {
//             return res.status(401).json({
//                 status: 'fail',
//                 message: 'User not found'
//             });
//         }

//         // Attach user to request
//         req.user = user;
//         next();
//     } catch (err) {
//         res.status(401).json({
//             status: 'fail',
//             message: 'Invalid token'
//         });
//     }
// };

