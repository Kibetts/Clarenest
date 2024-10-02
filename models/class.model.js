const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    schedule: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' }
});

module.exports = mongoose.model('Class', classSchema);
