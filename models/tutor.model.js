// const mongoose = require('mongoose');

// const tutorSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     role: { type: String, default: 'tutor' },
//     password: { type: String, required: true },
//     subjects: [{ type: String }],
//     classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
//     admin: { type: Boolean, default: false },
//     notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
// });

// module.exports = mongoose.model('Tutor', tutorSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tutorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
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
  
    subject: {
        type: String,
        required: [true, 'Subject is required']
    },
    role: {
        type: String,
        enum: ['tutor'],
        default: 'tutor'
    },
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    phoneNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return /^\d{10,15}$/.test(v); // Validates a phone number of 10-15 digits
            },
            message: 'Please enter a valid phone number'
        }
    },
    admin: { type: Boolean, default: false },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
});

tutorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

tutorSchema.methods.isPasswordValid = function (password) {
    return bcrypt.compare(password, this.password);
};

const Tutor = mongoose.model('Tutor', tutorSchema);
module.exports = Tutor;
