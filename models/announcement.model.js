const mongoose = require('mongoose');
const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientType: {
        type: String,
        enum: ['all', 'students', 'tutors', 'parents', 'specific'],
        required: true
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    expiryDate: Date
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement