const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    permissions: {
        type: [String],
        default: ['read', 'write', 'manage'], 
        enum: ['read', 'write', 'delete', 'manage']
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return /^\d{10,15}$/.test(v); 
            },
            message: 'Please enter a valid phone number'
        }
    },
});

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

adminSchema.methods.isPasswordValid = function (password) {
    return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
