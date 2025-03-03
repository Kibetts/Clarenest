const mongoose = require('mongoose');

// const lessonSchema = new mongoose.Schema({
//     name: { 
//         type: String, 
//         required: [true, 'Lesson name is required'],
//         trim: true
//     },
//     subject: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Subject',
//         required: true
//     },
//     tutor: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     // students: [{
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: 'User'
//     // }],
//     students: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Student'
//     }],
//     schedule: [{
//         day: {
//             type: String,
//             enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
//             required: true
//         },
//         startTime: {
//             type: Date,
//             required: true
//         },
//         endTime: {
//             type: Date,
//             required: true
//         }
//     }],
//     capacity: {
//         type: Number,
//         required: true,
//         min: [1, 'Lesson capacity must be at least 1']
//     },
//     currentEnrollment: {
//         type: Number,
//         default: 0
//     },
//     gradeLevel: {
//         type: Number,
//         required: [true, 'Grade level is required'],
//         min: 1,
//         max: 12
//     }
// }, { timestamps: true });

// lessonSchema.pre('save', function(next) {
//     if (this.isModified('students')) {
//         this.currentEnrollment = this.students.length;
//     }
//     next();
// });

// const Lesson = mongoose.model('Lesson', lessonSchema);
// module.exports = Lesson;

const lessonSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Lesson name is required'],
        trim: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
schedule: [{
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    }
}],
    capacity: {
        type: Number,
        required: true,
        min: [1, 'Lesson capacity must be at least 1']
    },
    currentEnrollment: {
        type: Number,
        default: 0
    },
    gradeLevel: {
        type: String,
        required: [true, 'Grade level is required'],
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', 
               '7th', '8th', '9th', '10th', '11th', '12th']
    }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;