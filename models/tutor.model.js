const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'tutor' },
    password: { type: String, required: true },
    subjects: [{ type: String }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    admin: { type: Boolean, default: false },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
});

module.exports = mongoose.model('Tutor', tutorSchema);
