const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['academic', 'attendance', 'financial', 'system'],
        required: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: mongoose.Schema.Types.Mixed,
    dateRange: {
        start: Date,
        end: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;