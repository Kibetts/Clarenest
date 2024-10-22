const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student reference is required']
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject reference is required']
    },
    assignments: [{
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment'
        },
        score: Number,
        maxScore: Number
    }],
    finalExam: {
        score: Number,
        maxScore: Number
    },
    overallGrade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'F']
    },
    comments: String,
    issuedDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

resultSchema.methods.calculateOverallGrade = function() {
    let totalScore = 0;
    let totalMaxScore = 0;

    this.assignments.forEach(assignment => {
        totalScore += assignment.score;
        totalMaxScore += assignment.maxScore;
    });

    if (this.finalExam) {
        totalScore += this.finalExam.score;
        totalMaxScore += this.finalExam.maxScore;
    }

    const percentageScore = (totalScore / totalMaxScore) * 100;

    if (percentageScore >= 90) this.overallGrade = 'A';
    else if (percentageScore >= 80) this.overallGrade = 'B';
    else if (percentageScore >= 70) this.overallGrade = 'C';
    else if (percentageScore >= 60) this.overallGrade = 'D';
    else this.overallGrade = 'F';
};

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;