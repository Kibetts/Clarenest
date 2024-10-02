const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
    date: { type: Date, required: true }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
