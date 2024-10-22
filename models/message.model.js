const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel',
        required: true
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Student', 'Tutor', 'Parent', 'Admin']
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientModel',
        required: true
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Student', 'Tutor', 'Parent', 'Admin']
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
