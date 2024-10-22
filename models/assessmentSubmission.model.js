const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedAnswer: {
        type: Number,
        required: true
    }
});

const assessmentSubmissionSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [answerSchema],
    score: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const AssessmentSubmission = mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);
module.exports = AssessmentSubmission;