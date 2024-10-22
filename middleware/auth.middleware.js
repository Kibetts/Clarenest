// const jwt = require('jsonwebtoken');
// const { promisify } = require('util');
// const User = require('../models/user.model');

// exports.authenticateJWT = async (req, res, next) => {
//     try {
//         let token;
//         if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//             token = req.headers.authorization.split(' ')[1];
//         }

//         if (!token) {
//             return res.status(401).json({ message: 'You are not logged in. Please log in to get access.' });
//         }

//         const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//         const currentUser = await User.findById(decoded.id);
//         if (!currentUser) {
//             return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
//         }


//         req.user = currentUser;
//         next();
//     } catch (err) {
//         console.error('JWT authentication error:', err); // log error
//         res.status(401).json({ message: 'Invalid token. Please log in again.' });
//     }
// };

// exports.authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({ message: 'You do not have permission to perform this action' });
//         }
//         next();
//     };
// };

// exports.requireEmailVerification = (req, res, next) => {
//     if (!req.user.isEmailVerified) {
//       return next(new AppError('Please verify your email to access this resource', 403));
//     }
//     next();
//   };

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
            return res.status(401).json({ message: 'You are not logged in. Please log in to get access.' });
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
        }

        req.user = currentUser;
        next();
    } catch (err) {
        console.error('JWT authentication error:', err);
        res.status(401).json({ message: 'Invalid token. Please log in again.' });
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