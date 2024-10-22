const mongoose = require('mongoose');
const User = require('./user.model');

const adminSchema = new mongoose.Schema({
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['Academic Affairs', 'Student Services', 'IT Support', 'Finance']
    },
    adminLevel: {
        type: String,
        required: [true, 'Admin level is required'],
        enum: ['Junior', 'Senior', 'Head']
    },
    permissions: [{
        type: String,
        enum: ['manage_users', 'manage_courses', 'manage_finances', 'system_settings']
    }]
}, { timestamps: true });

adminSchema.pre('save', function(next) {
    if (this.isNew) {
        this.role = 'admin';
    }
    next();
});

const Admin = User.discriminator('Admin', adminSchema);
module.exports = Admin;