const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true
    }
});

const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    gradeLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [questionSchema],
    dueDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

assessmentSchema.virtual('submissions', {
    ref: 'AssessmentSubmission',
    localField: '_id',
    foreignField: 'assessment'
});

const Assessment = mongoose.model('Assessment', assessmentSchema);
module.exports = Assessment;