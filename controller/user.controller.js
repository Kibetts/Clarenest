const User = require('../models/user.model');
const { ROLES, PERMISSIONS } = require('../config/roles');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getMe = async (req, res, next) => {
    // req.user is set by the authMiddleware
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    switch (user.role) {
        case 'student':
            await user.populate('courses');
            break;
        case 'tutor':
            await user.populate('classes');
            break;
        case 'parent':
            await user.populate('children');
            break;
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        if (req.body.role && req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can update roles' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateFeeStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { feesPaid } = req.body;

        if (typeof feesPaid !== 'boolean') {
            return next(new AppError('feesPaid must be a boolean value', 400));
        }

        const user = await User.findById(userId);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        if (user.role !== ROLES.STUDENT) {
            return next(new AppError('Fee status can only be updated for students', 400));
        }

        user.feesPaid = feesPaid;
        await user.save();

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    feesPaid: user.feesPaid
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};