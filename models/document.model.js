const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

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
    filePath: {
        type: String,
        required: [true, 'File path is required']
    },
    filename: {
        type: String,
        required: [true, 'Original filename is required']
    },
    mimetype: {
        type: String,
        required: [true, 'File mimetype is required']
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

// Middleware to delete file when document is deleted
documentSchema.pre('remove', async function(next) {
    try {
        const filePath = path.join(__dirname, '..', 'uploads', this.filePath);
        await fs.unlink(filePath);
        next();
    } catch (error) {
        console.error('Error deleting file:', error);
        next(error);
    }
});

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;