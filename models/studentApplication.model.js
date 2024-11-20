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
            type: String,
            required: true,
            enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']
        },
        lastSchoolAttended: String
    },
    parentInfo: {
        name: String,
        email: String,
        phoneNumber: String,
        relationship: {
            type: String,
            enum: ['Mother', 'Father', 'Guardian', 'Other'],
            required: true
        },
        parentRegistrationComplete: {
            type: Boolean,
            default: false
        }
    },
    learningPreferences: {
        scheduleType: {
            type: String,
            enum: ['full time', 'afterclasses'],
            required: true
        }
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
    accountCreationTokenExpires: Date,
    parentAccountCreationToken: String,
    parentAccountCreationTokenExpires: Date
}, { timestamps: true });

const StudentApplication = mongoose.model('StudentApplication', studentApplicationSchema);
module.exports = StudentApplication;