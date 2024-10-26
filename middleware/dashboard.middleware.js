const AppError = require('../utils/appError');

exports.validateDashboardAccess = async (req, res, next) => {
    try {
        // Verify user has required permissions
        const { role } = req.user;
        const allowedRoles = {
            student: ['student'],
            tutor: ['tutor', 'admin'],
            admin: ['admin'],
            parent: ['parent']
        };

        const requestedDashboard = req.path.split('/')[1];
        if (!allowedRoles[requestedDashboard]?.includes(role)) {
            return next(new AppError('You do not have permission to access this dashboard', 403));
        }

        next();
    } catch (err) {
        next(new AppError('Error validating dashboard access', 500));
    }
};

exports.validateDashboardData = async (req, res, next) => {
    try {
        // Verify all required data is available
        const { role } = req.user;
        
        if (role === 'student') {
            const student = await Student.findById(req.user._id);
            if (!student || !student.grade || !student.subjects.length) {
                return next(new AppError('Incomplete student profile', 400));
            }
        }

        if (role === 'tutor') {
            const tutor = await Tutor.findById(req.user._id);
            if (!tutor || !tutor.subjects.length) {
                return next(new AppError('Incomplete tutor profile', 400));
            }
        }

        if (role === 'parent') {
            const parent = await Parent.findById(req.user._id);
            if (!parent || !parent.children.length) {
                return next(new AppError('No children associated with this parent account', 400));
            }
        }

        next();
    } catch (err) {
        next(new AppError('Error validating dashboard data', 500));
    }
};

// Add cache middleware for performance
exports.cacheDashboard = (duration) => {
    return (req, res, next) => {
        const key = `dashboard:${req.user.role}:${req.user._id}`;
        
        redis.get(key, (err, data) => {
            if (err) return next();
            
            if (data) {
                return res.status(200).json(JSON.parse(data));
            }
            
            res.originalJson = res.json;
            res.json = (body) => {
                redis.setex(key, duration, JSON.stringify(body));
                res.originalJson(body);
            };
            next();
        });
    };
};

// real-time update functionality
exports.setupRealTimeUpdates = (io) => {
    io.on('connection', (socket) => {
        socket.on('joinDashboard', (userId) => {
            socket.join(`dashboard:${userId}`);
        });

        socket.on('dashboardUpdate', (data) => {
            io.to(`dashboard:${data.userId}`).emit('dashboardChanged', data);
        });
    });
};