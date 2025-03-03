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
        type: String,
        required: true,
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', 
               '7th', '8th', '9th', '10th', '11th', '12th']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);
module.exports = CourseMaterial;