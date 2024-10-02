const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    grades: [{ assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }, grade: { type: String } }]
});

module.exports = mongoose.model('Result', resultSchema);
