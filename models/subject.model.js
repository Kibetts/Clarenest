const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Subject title is required'],
        trim: true,
        maxlength: [100, 'Subject title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Subject description is required'],
        maxlength: [500, 'Subject description cannot be more than 500 characters']
    },
    duration: {
        type: Number,
        required: [true, 'Subject duration is required'],
        min: [1, 'Duration must be at least 1 hour']
    },
    level: {
        type: String,
        required: [true, 'Subject level is required'],
        enum: ['Elementary', 'Middle School', 'High School']
    },
    gradeLevel: {
        type: Number,
        required: [true, 'Grade level is required'],
        min: 1,
        max: 12
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Subject must have a tutor']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    enrollmentCapacity: {
        type: Number,
        required: [true, 'Enrollment capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    currentEnrollment: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

subjectSchema.virtual('availableSpots').get(function() {
    return this.enrollmentCapacity - this.currentEnrollment;
});

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;