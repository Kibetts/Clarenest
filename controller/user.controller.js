const User = require('../models/user.model');
const { ROLES, PERMISSIONS } = require('../config/roles');

exports.getAllUsers = async (req, res) => {
    try {
        let query = User.find();
        
        // Add role filter if provided
        if (req.query.role) {
            query = query.find({ role: req.query.role });
        }
        
        const users = await query
            // .select('-password +isEmailVerified')
            // .select('+accountCreationToken +accountCreationTokenExpires');
            
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (err) {
        console.error('Error in getAllUsers:', err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Error fetching users'
        });
    }
};


exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .select('-password +isEmailVerified')
        .select('+verificationToken +verificationTokenExpires')
        .select('+accountCreationToken +accountCreationTokenExpires');

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
        // Only select password if specifically requested and user is authorized
        const selectFields = req.query.includePassword && req.user.role === 'admin' 
            ? '+password +verificationToken +verificationTokenExpires' 
            : '-password';
            
        const user = await User.findById(req.params.id)
            .select(selectFields);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            status: 'success',
            data: { user }
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

// exports.updateUserStatus = async (req, res) => {
//     try {
//       await User.findByIdAndUpdate(req.user._id, {
//         status: 'online',
//         lastActive: new Date()
//       });
      
//       res.status(200).json({
//         status: 'success',
//         message: 'User status updated'
//       });
//     } catch (err) {
//       res.status(500).json({
//         status: 'error',
//         message: err.message
//       });
//     }
//   };
exports.updateUserStatus = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Authentication required'
            });
        }

        // Update user status
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                status: 'online',
                lastActive: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User status updated successfully'
        });
    } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user status',
            error: err.message
        });
    }
};