const mongoose = require('mongoose');
const User = require('./user.model');

const studentSchema = new mongoose.Schema({
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    grade: {
        type: String,
        required: [true, 'Grade level is required'],
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', 
               '7th', '8th', '9th', '10th', '11th', '12th']
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent',
        default: null
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
        default: "offline"
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    discriminatorKey: 'role',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for assessment submissions
studentSchema.virtual('assessmentSubmissions', {
    ref: 'AssessmentSubmission',
    localField: '_id',
    foreignField: 'student'
});

// Instance method for updating status
studentSchema.methods.updateStatus = function(status) {
    this.status = status;
    this.lastActive = new Date();
}; 

// Pre-save middleware
studentSchema.pre('save', function(next) {
    if (this.isNew) {
        this.role = 'student';
    }
    next();
});

const Student = User.discriminator('Student', studentSchema);
module.exports = Student;