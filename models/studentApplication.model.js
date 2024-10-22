const mongoose = require('mongoose');

const studentApplicationSchema = new mongoose.Schema({
    personalInfo: {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        dateOfBirth: Date,
        gender: String,
        nationality: String,
        location: String
    },
    educationalInfo: {
        currentGradeLevel: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        lastSchoolAttended: String,
        interestedSubjects: [String]
    },
    parentInfo: {
        name: String,
        email: String,
        phoneNumber: String
    },
    learningPreferences: {
        preferredSchedule: String,
        learningInterests: [String]
    },
    specialNeeds: {
        hasSpecialNeeds: Boolean,
        accommodationsRequired: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'account_created'],
        default: 'pending'
    },
    accountCreationToken: String,
    accountCreationTokenExpires: Date
}, { timestamps: true });

const StudentApplication = mongoose.model('StudentApplication', studentApplicationSchema);
module.exports = StudentApplication;