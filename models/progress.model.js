// const mongoose = require('mongoose');

// const progressSchema = new mongoose.Schema({
//     student: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: [true, 'Student reference is required']
//     },
//     course: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Course',
//         required: [true, 'Course reference is required']
//     },
//     completedLessons: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Class'
//     }],
//     quizScores: [{
//         quiz: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Assignment'
//         },
//         score: Number
//     }],
//     overallGrade: {
//         type: Number,
//         min: 0,
//         max: 100
//     },
//     lastActivity: {
//         type: Date,
//         default: Date.now
//     },
//     status: {
//         type: String,
//         enum: ['In Progress', 'Completed', 'On Hold'],
//         default: 'In Progress'
//     }
// }, { timestamps: true });

// progressSchema.methods.updateOverallGrade = function() {
//     if (this.quizScores.length > 0) {
//         const totalScore = this.quizScores.reduce((sum, quiz) => sum + quiz.score, 0);
//         this.overallGrade = totalScore / this.quizScores.length;
//     } else {
//         this.overallGrade = null;
//     }
// };

// const Progress = mongoose.model('Progress', progressSchema);
// module.exports = Progress;

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    quizScores: [{
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment'
        },
        score: Number
    }],
    overallGrade: {
        type: Number,
        min: 0,
        max: 100
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['In Progress', 'Completed', 'On Hold'],
        default: 'In Progress'
    }
}, { timestamps: true });

progressSchema.methods.updateOverallGrade = function() {
    if (this.quizScores.length > 0) {
        const totalScore = this.quizScores.reduce((sum, quiz) => sum + quiz.score, 0);
        this.overallGrade = totalScore / this.quizScores.length;
    } else {
        this.overallGrade = null;
    }
};

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
