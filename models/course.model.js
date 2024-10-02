const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    tutors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' }]
});

module.exports = mongoose.model('Course', courseSchema);
