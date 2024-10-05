const mongoose = require('mongoose');

// const studentSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     role: { type: String, default: 'student' },
//     password: { type: String, required: true },
//     class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
//     assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
//     attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
//     grades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }],
//     notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
// });

// module.exports = mongoose.model('Student', studentSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
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
        enum: ['student'],
        default: 'student'
    },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
    grades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
});

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

studentSchema.methods.isPasswordValid = function (password) {
    return bcrypt.compare(password, this.password);
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
