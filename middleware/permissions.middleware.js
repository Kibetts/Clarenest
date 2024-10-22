const { PERMISSIONS } = require('../config/roles');

const createPermissionMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

module.exports = {
    allowReadOnly: createPermissionMiddleware(PERMISSIONS.READ_ONLY),
    allowWrite: createPermissionMiddleware(PERMISSIONS.WRITE),
    allowAdminOnly: createPermissionMiddleware(PERMISSIONS.ADMIN_ONLY)
};