const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: [true, 'Attendance must be associated with a lesson']
    },
    date: {
        type: Date,
        required: [true, 'Attendance date is required'],
        default: Date.now
    },
    attendees: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required']
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late'],
            required: [true, 'Attendance status is required']
        },
        note: String
    }]
}, {
    timestamps: true
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;