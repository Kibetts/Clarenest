const mongoose = require('mongoose');
const User = require('./user.model');

const studentSchema = new mongoose.Schema({
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    grade: {
        type: Number,
        required: [true, 'Grade level is required'],
        min: 1,
        max: 12
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent'
    },
    attendanceRecord: [{
        date: Date,
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late']
        }
    }],
    status: {
        type: String,
        enum: ["online", "offline"],
        default: "offline",
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

studentSchema.virtual('assessmentSubmissions', {
    ref: 'AssessmentSubmission',
    localField: '_id',
    foreignField: 'student'
});


studentSchema.pre('save', function(next) {
    if (this.isNew) {
        this.role = 'student';
    }
    next();
});

studentSchema.methods.updateStatus = function(status) {
    this.status = status;
    this.lastActive = new Date();
};

const Student = User.discriminator('Student', studentSchema);
module.exports = Student;