const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
    dueDate: { type: Date, required: true },
    submissions: [{ student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, file: { type: String }, grade: { type: String } }]
});

module.exports = mongoose.model('Assignment', assignmentSchema);
