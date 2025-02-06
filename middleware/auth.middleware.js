const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { promisify } = require('util');

exports.authenticateJWT = async (req, res, next) => {
    try {
        console.log('Auth headers:', req.headers.authorization); // Debug log

        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Extracted token:', token); // Debug log
        }

        if (!token) {
            console.log('No token found in request'); // Debug log
            return res.status(401).json({ 
                status: 'error',
                message: 'No token provided. Please log in.',
                code: 'NO_TOKEN'
            });
        }

        try {
            console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET); // Debug log
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded); // Debug log

            const currentUser = await User.findById(decoded.id);
            console.log('Found user:', !!currentUser); // Debug log
            
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
            console.error('Token verification error:', err); // Debug log
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

