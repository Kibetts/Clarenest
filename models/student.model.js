const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'student' },
    password: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
    grades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
});

module.exports = mongoose.model('Student', studentSchema);
