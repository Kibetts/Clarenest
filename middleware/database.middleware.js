const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const checkDatabaseConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return next(new AppError('Database connection is not ready', 500));
    }
    next();
};

module.exports = checkDatabaseConnection;