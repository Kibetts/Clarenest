const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Notification must have a recipient']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        maxlength: [500, 'Notification message cannot be more than 500 characters']
    },
    type: {
        type: String,
        enum: ['Assignment', 'Grade', 'Announcement', 'Other'],
        required: [true, 'Notification type is required']
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemModel'
    },
    itemModel: {
        type: String,
        enum: ['Assignment', 'Class', 'Course']
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;