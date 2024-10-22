// const User = require('../models/user.model');
// const AppError = require('../utils/appError');

// const checkFeeStatus = async (req, res, next) => {
//   try {
//     // Only check for students
//     if (req.user.role !== 'student') {
//       return next();
//     }

//     const student = await User.findById(req.user.id);

//     if (!student) {
//       return next(new AppError('Student not found', 404));
//     }

//     const now = new Date();

//     // Check if student has temporary access
//     if (student.temporaryAccess.granted && student.temporaryAccess.expiresAt > now) {
//       return next();
//     }

//     // Check if fees are paid or partially paid and not overdue
//     if (student.feeStatus === 'paid' || (student.feeStatus === 'partial' && (!student.nextPaymentDue || student.nextPaymentDue > now))) {
//       return next();
//     }

//     // If we've reached this point, the student doesn't have access
//     return next(new AppError('Please pay your fees to access this resource', 403));
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = checkFeeStatus;
const User = require('../models/user.model');
const AppError = require('../utils/appError');

const checkFeeStatus = async (req, res, next) => {
  try {
    // Only check for students
    if (req.user.role !== 'student') {
      return next();
    }

    const student = await User.findById(req.user.id);

    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    const now = new Date();

    // Check if student has temporary access
    if (student.temporaryAccess.granted && student.temporaryAccess.expiresAt > now) {
      return next();
    }

    // Check if fees are paid or partially paid and not overdue
    if (student.feeStatus === 'paid' || (student.feeStatus === 'partial' && (!student.nextPaymentDue || student.nextPaymentDue > now))) {
      return next();
    }

    // If we've reached this point, the student doesn't have access
    return next(new AppError('Please pay your fees to access this resource', 403));
  } catch (error) {
    next(error);
  }
};

module.exports = checkFeeStatus;
