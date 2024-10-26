const mongoose = require('mongoose');

const tutorApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: false
    },
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
        nationality: String,
        location: String
    },
    professionalInfo: {
        academicQualifications: [String],
        teachingExperience: Number,
        subjectsSpecialization: [String],
        certifications: [String],
        preferredGradeLevels: [{
            type: String,
            enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', 
                   '7th', '8th', '9th', '10th', '11th', '12th'],
            required: true
        }],
        availability: [String]
    },
    additionalSkills: {
        technologySkills: [String],
        languagesSpoken: [String]
    },
    documents: {
        cv: {
            filename: String,
            path: String,
            mimetype: String
        },
        academicCertificates: [{
            filename: String,
            path: String,
            mimetype: String
        }],
        governmentId: {
            filename: String,
            path: String,
            mimetype: String
        }
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

// Clean up files when application is deleted
tutorApplicationSchema.pre('remove', async function(next) {
    const { deleteFile } = require('../utils/fileUpload.util');
    
    if (this.documents.cv) {
        await deleteFile(this.documents.cv.path);
    }
    
    if (this.documents.academicCertificates) {
        for (const cert of this.documents.academicCertificates) {
            await deleteFile(cert.path);
        }
    }
    
    if (this.documents.governmentId) {
        await deleteFile(this.documents.governmentId.path);
    }
    
    next();
});

const TutorApplication = mongoose.model('TutorApplication', tutorApplicationSchema);
module.exports = TutorApplication;