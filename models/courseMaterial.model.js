const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Material title is required']
    },
    description: String,
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    type: {
        type: String,
        enum: ['document', 'video', 'link', 'assignment'],
        required: true
    },
    fileUrl: String,
    content: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gradeLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);