const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    completion: { type: Number, default: 0 }
});

module.exports = mongoose.model('Progress', progressSchema);
