const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Document title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender is required']
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;