const ROLES = {
    ADMIN: 'admin',
    TUTOR: 'tutor',
    STUDENT: 'student',
    PARENT: 'parent'
};

const PERMISSIONS = {
    READ_ONLY: [ROLES.STUDENT, ROLES.PARENT, ROLES.TUTOR, ROLES.ADMIN],
    WRITE: [ROLES.TUTOR, ROLES.ADMIN],
    ADMIN_ONLY: [ROLES.ADMIN]
};

module.exports = {
    ROLES,
    PERMISSIONS
};
