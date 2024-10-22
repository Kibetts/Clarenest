// const mongoose = require('mongoose');

// const classSchema = new mongoose.Schema({
//     name: { 
//         type: String, 
//         required: [true, 'Class name is required'],
//         trim: true
//     },
//     course: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Course',
//         required: true
//     },
//     tutor: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     students: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }],
//     schedule: [{
//         day: {
//             type: String,
//             enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
//             required: true
//         },
//         startTime: {
//             type: String,
//             required: true
//         },
//         endTime: {
//             type: String,
//             required: true
//         }
//     }],
//     capacity: {
//         type: Number,
//         required: true,
//         min: [1, 'Class capacity must be at least 1']
//     },
//     currentEnrollment: {
//         type: Number,
//         default: 0
//     }
// }, { timestamps: true });

// classSchema.pre('save', function(next) {
//     if (this.isModified('students')) {
//         this.currentEnrollment = this.students.length;
//     }
//     next();
// });

// const Class = mongoose.model('Class', classSchema);
// module.exports = Class;

const mongoose = require('mongoose');

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
        ref: 'User'
    }],
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
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
        type: Number,
        required: [true, 'Grade level is required'],
        min: 1,
        max: 12
    }
}, { timestamps: true });

lessonSchema.pre('save', function(next) {
    if (this.isModified('students')) {
        this.currentEnrollment = this.students.length;
    }
    next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
