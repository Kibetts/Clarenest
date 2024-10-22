const mongoose = require('mongoose');
const tutorApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    personalInfo: {
        fullName: {
            type: String,
            required: true
        },
        dateOfBirth: Date,
        nationality: String,
        location: String
    },
    professionalInfo: {
        academicQualifications: [String],
        teachingExperience: Number,
        subjectsSpecialization: [String],
        certifications: [String],
        preferredGradeLevels: [{
            type: Number,
            min: 1,
            max: 12
        }],
        availability: [String]
    },
    additionalSkills: {
        technologySkills: [String],
        languagesSpoken: [String]
    },
    documents: {
        cv: String, // URL to uploaded document
        academicCertificates: [String], // URLs to uploaded documents
        governmentId: String // URL to uploaded document
    },
    professionalReferences: [{
        name: String,
        relationship: String,
        contactInfo: String
    }],
    essay: {
        motivation: String,
        teachingPhilosophy: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    applicationDate: {
        type: Date,
        default: Date.now
    }
});

const TutorApplication = mongoose.model('TutorApplication', tutorApplicationSchema);
module.exports = TutorApplication;
