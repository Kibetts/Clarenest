const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Assignment title is required'],
        trim: true,
        maxlength: [100, 'Assignment title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Assignment description is required'],
        maxlength: [1000, 'Assignment description cannot be more than 1000 characters']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: [true, 'Assignment must be associated with a class']
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assignment must have a tutor']
    },
    totalPoints: {
        type: Number,
        required: [true, 'Total points for the assignment are required'],
        min: [0, 'Total points cannot be negative']
    },
    attachments: {
        filename: String,
        path: String,
        mimetype: String
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        submissionDate: {
            type: Date,
            default: Date.now
        },
        content: String,
        files: [{
            filename: String,
            path: String,
            mimetype: String
        }],
        grade: {
            type: Number,
            min: [0, 'Grade cannot be negative'],
            max: [function() { return this.totalPoints; }, 'Grade cannot exceed total points']
        },
        feedback: String
    }]
}, {
    timestamps: true
});

// Middleware to delete files when assignment is deleted
assignmentSchema.pre('remove', async function(next) {
    try {
        // Delete assignment attachment if exists
        if (this.attachments && this.attachments.path) {
            await fs.unlink(path.join(__dirname, '..', this.attachments.path));
        }

        // Delete all submission files
        for (const submission of this.submissions) {
            if (submission.files && submission.files.length > 0) {
                for (const file of submission.files) {
                    if (file.path) {
                        await fs.unlink(path.join(__dirname, '..', file.path));
                    }
                }
            }
        }
        next();
    } catch (error) {
        console.error('Error deleting assignment files:', error);
        next(error);
    }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;