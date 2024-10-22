const mongoose = require('mongoose');
const User = require('./user.model');

const tutorSchema = new mongoose.Schema({
    subjects: [{
        type: String,
        required: [true, 'At least one subject is required']
    }],
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    qualifications: [{
        degree: String,
        institution: String,
        year: Number
    }],
    yearsOfExperience: {
        type: Number,
        required: [true, 'Years of experience is required'],
        min: 0
    },
    availability: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String,
        endTime: String
    }],
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    reviews: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

tutorSchema.pre('save', function(next) {
    if (this.isNew) {
        this.role = 'tutor';
    }
    next();
});

tutorSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.rating = 0;
    } else {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.rating = totalRating / this.reviews.length;
    }
};

tutorSchema.methods.updateStatus = function(status) {
    this.status = status;
    this.lastActive = new Date();
};

tutorSchema.methods.assignClass = function(classId) {
    if (!this.assignedClasses.includes(classId)) {
        this.assignedClasses.push(classId);
    }
};

tutorSchema.methods.removeAssignedClass = function(classId) {
    this.assignedClasses = this.assignedClasses.filter(id => id.toString() !== classId.toString());
};

const Tutor = User.discriminator('Tutor', tutorSchema);
module.exports = Tutor;