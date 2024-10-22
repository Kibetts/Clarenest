const Joi = require('joi')

const validateStudentApplication = (data) => {
    const schema = Joi.object({
        personalInfo: Joi.object({
            fullName: Joi.string().required(),
            email: Joi.string().email().required(),
            dateOfBirth: Joi.date().required(),
            gender: Joi.string().valid('Male', 'Female', 'Other').required(),
            nationality: Joi.string().required(),
            location: Joi.string().required()
        }).required(),
        educationalInfo: Joi.object({
            currentGradeLevel: Joi.number().integer().min(1).max(12).required(),
            lastSchoolAttended: Joi.string().required(),
            interestedSubjects: Joi.array().items(Joi.string()).min(1).required()
        }).required(),
        parentInfo: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().required()
        }).required(),
        learningPreferences: Joi.object({
            preferredSchedule: Joi.string().required(),
            learningInterests: Joi.array().items(Joi.string()).min(1).required()
        }).required(),
        specialNeeds: Joi.object({
            hasSpecialNeeds: Joi.boolean().required(),
            accommodationsRequired: Joi.string().when('hasSpecialNeeds', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            })
        }).required()
    });

    return schema.validate(data);
};

const validateTutorApplication = (data) => {
    const schema = Joi.object({
        personalInfo: Joi.object({
            fullName: Joi.string().required(),
            dateOfBirth: Joi.date().required(),
            nationality: Joi.string().required(),
            location: Joi.string().required()
        }).required(),
        professionalInfo: Joi.object({
            academicQualifications: Joi.array().items(Joi.string()).min(1).required(),
            teachingExperience: Joi.number().min(0).required(),
            subjectsSpecialization: Joi.array().items(Joi.string()).min(1).required(),
            certifications: Joi.array().items(Joi.string()),
            preferredGradeLevels: Joi.array().items(Joi.number().integer().min(1).max(12)).min(1).required(),
            availability: Joi.array().items(Joi.string()).min(1).required()
        }).required(),
        additionalSkills: Joi.object({
            technologySkills: Joi.array().items(Joi.string()),
            languagesSpoken: Joi.array().items(Joi.string()).min(1).required()
        }).required(),
        documents: Joi.object({
            cv: Joi.string().uri().required(),
            academicCertificates: Joi.array().items(Joi.string().uri()).min(1).required(),
            governmentId: Joi.string().uri().required()
        }).required(),
        professionalReferences: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            relationship: Joi.string().required(),
            contactInfo: Joi.string().required()
        })).min(2).required(),
        essay: Joi.object({
            motivation: Joi.string().min(100).required(),
            teachingPhilosophy: Joi.string().min(100).required()
        }).required()
    });

    return schema.validate(data);
};

module.exports = {
    validateStudentApplication,
    validateTutorApplication
};