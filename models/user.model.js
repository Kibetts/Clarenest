const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        enum: ['pending', 'verified', 'active'],
        default: 'pending'
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    feesPaid: {
        type: Boolean,
        default: false
    },

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
    temporaryAccess: {
        granted: {
            type: Boolean,
            default: false
        },
        expiresAt: Date
    },
    isEmailVerified: {
        type: Boolean,
        default: true   // Return to false
      },
      verificationToken: String,
      verificationTokenExpires: Date,
      
    nextPaymentDue: Date,
    grade: {
        type: String,
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'],
        required: function() { return this.role === 'student'; }
    },
    subjects: [{
        type: String,
        required: function() { return this.role === 'tutor'; }
    }],
    
}, { timestamps: true });

// userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//     return await bcrypt.compare(candidatePassword, userPassword);
// };

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    console.log('Comparing passwords:', { candidatePassword, userPassword });
    const isMatch = await bcrypt.compare(candidatePassword, userPassword);
    console.log('Password match:', isMatch);
    return isMatch;
};

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});



const User = mongoose.model('User', userSchema);

module.exports = User;

