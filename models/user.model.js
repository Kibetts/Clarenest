const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
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
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'tutor', 'student', 'parent'],
        required: true
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
    status: {
        type: String,
        enum: ['pending', 'offline', 'online', 'active', 'suspended', 'inactive'],
        default: 'offline'
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    // Email verification fields
    isEmailVerified: {
        type: Boolean,
        default: true
    },
    // Account creation fields
    accountCreationToken: {
        type: String,
        select: false
    },
    accountCreationTokenExpires: {
        type: Date,
        select: false
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpire: {
        type: Date,
        select: false
    },
    // Fee related fields
    feeStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    },
    totalFees: {
        type: Number,
        default: 0
    },
    paidFees: {
        type: Number,
        default: 0
    },
    nextPaymentDue: Date,
    temporaryAccess: {
        granted: {
            type: Boolean,
            default: false
        },
        expiresAt: Date
    },
    // Role specific fields
    grade: {
        type: String,
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'],
        required: function() { return this.role === 'student'; }
    },
    subjects: [{
        type: String,
        required: function() { return this.role === 'tutor'; }
    }],
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}, { discriminatorKey: 'role' });

// Improved password comparison method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, userPassword);
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

// Enhanced verification token creation
userSchema.methods.createVerificationToken = function() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return rawToken; // Return raw token for email
};

// Enhanced email verification method
userSchema.methods.verifyEmail = function() {
    this.isEmailVerified = true;
    this.status = 'active';
    this.verificationToken = undefined;
    this.verificationTokenExpires = undefined;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    return resetToken;
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
    this.lastActive = Date.now();
    return this.save({ validateBeforeSave: false });
};

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }
});

// Clean up expired tokens middleware
userSchema.pre('save', function(next) {
    if (this.verificationTokenExpires && this.verificationTokenExpires < Date.now()) {
        this.verificationToken = undefined;
        this.verificationTokenExpires = undefined;
    }
    if (this.resetPasswordExpire && this.resetPasswordExpire < Date.now()) {
        this.resetPasswordToken = undefined;
        this.resetPasswordExpire = undefined;
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;