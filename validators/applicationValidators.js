const Joi = require("joi");

const validateStudentApplication = (data) => {
  const schema = Joi.object({
    personalInfo: Joi.object({
      fullName: Joi.string().required(),
      email: Joi.string().email().required(),
      dateOfBirth: Joi.date().required(),
      gender: Joi.string().valid("Male", "Female", "Other").required(),
      nationality: Joi.string().required(),
      location: Joi.string().required(),
    }).required(),
    educationalInfo: Joi.object({
      currentGradeLevel: Joi.string()
        .valid('1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th')
        .required(),
      lastSchoolAttended: Joi.string().required(),
    }).required(),
    parentInfo: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phoneNumber: Joi.string().required(),
      relationship: Joi.string()
        .valid('Mother', 'Father', 'Guardian', 'Other')
        .required(),
      parentRegistrationComplete: Joi.boolean().default(false),
    }).required(),
    learningPreferences: Joi.object({
      scheduleType: Joi.string()
        .valid('full time', 'afterclasses')
        .required(),
    }).required(),
    specialNeeds: Joi.object({
      hasSpecialNeeds: Joi.boolean().required(),
      accommodationsRequired: Joi.when("hasSpecialNeeds", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.string().allow("", null),
      }),
    }).required(),
    status: Joi.string()
      .valid('pending', 'approved', 'rejected', 'account_created')
      .default('pending'),
    accountCreationToken: Joi.string().allow(null),
    accountCreationTokenExpires: Joi.date().allow(null),
  });

  return schema.validate(data);
};

const validateTutorApplication = (data) => {
  const schema = Joi.object({
    personalInfo: Joi.object({
      fullName: Joi.string().required(),
      email: Joi.string().email().required(),
      dateOfBirth: Joi.date().required(),
      nationality: Joi.string().required(),
      location: Joi.string().required(),
    }).required(),

    professionalInfo: Joi.object({
      academicQualifications: Joi.array()
        .items(Joi.string().trim().min(1).required())
        .min(1)
        .required(),
      teachingExperience: Joi.number().min(0).required(),
      subjectsSpecialization: Joi.array()
        .items(Joi.string().trim().min(1).required())
        .min(1)
        .required(),
      certifications: Joi.array().items(Joi.string().trim().allow("")),
      preferredGradeLevels: Joi.array()
        .items(Joi.string().valid(
          '1st', '2nd', '3rd', '4th', '5th', '6th', 
          '7th', '8th', '9th', '10th', '11th', '12th'
        ))
        .min(1)
        .required(),
      availability: Joi.array()
        .items(Joi.string().trim().min(1).required())
        .min(1)
        .required(),
    }).required(),

    additionalSkills: Joi.object({
      technologySkills: Joi.array().items(Joi.string()),
      languagesSpoken: Joi.array().items(Joi.string()).min(1).required(),
    }).required(),

    professionalReferences: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          relationship: Joi.string().required(),
          contactInfo: Joi.string().required(),
        })
      )
      .min(2)
      .required(),

    essay: Joi.object({
      motivation: Joi.string().min(100).required(),
      teachingPhilosophy: Joi.string().min(100).required(),
    }).required(),

    status: Joi.string()
      .valid('pending', 'approved', 'rejected')
      .default('pending'),
      
    applicationDate: Joi.date().default(Date.now),

    documents: Joi.object({
      cv: Joi.object({
        filename: Joi.string(),
        path: Joi.string(),
        mimetype: Joi.string()
      }),
      academicCertificates: Joi.array().items(
        Joi.object({
          filename: Joi.string(),
          path: Joi.string(),
          mimetype: Joi.string()
        })
      ),
      governmentId: Joi.object({
        filename: Joi.string(),
        path: Joi.string(),
        mimetype: Joi.string()
      })
    }).optional()
  });

  return schema.validate(data);
};

const validateTutorFiles = (files) => {
  const schema = Joi.object({
    cv: Joi.array()
      .items(
        Joi.object({
          fieldname: Joi.string().required(),
          originalname: Joi.string().required(),
          encoding: Joi.string().required(),
          mimetype: Joi.string()
            .valid(
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            .required(),
          destination: Joi.string().required(),
          filename: Joi.string().required(),
          path: Joi.string().required(),
          size: Joi.number()
            .max(5 * 1024 * 1024)
            .required(),
        })
      )
      .length(1)
      .required(),

    academicCertificates: Joi.array()
      .items(
        Joi.object({
          fieldname: Joi.string().required(),
          originalname: Joi.string().required(),
          encoding: Joi.string().required(),
          mimetype: Joi.string().valid("application/pdf").required(),
          destination: Joi.string().required(),
          filename: Joi.string().required(),
          path: Joi.string().required(),
          size: Joi.number()
            .max(5 * 1024 * 1024)
            .required(),
        })
      )
      .min(1)
      .max(5)
      .required(),

    governmentId: Joi.array()
      .items(
        Joi.object({
          fieldname: Joi.string().required(),
          originalname: Joi.string().required(),
          encoding: Joi.string().required(),
          mimetype: Joi.string()
            .valid("application/pdf", "image/jpeg", "image/png")
            .required(),
          destination: Joi.string().required(),
          filename: Joi.string().required(),
          path: Joi.string().required(),
          size: Joi.number()
            .max(5 * 1024 * 1024)
            .required(),
        })
      )
      .length(1)
      .required(),
  });

  return schema.validate(files);
};

module.exports = {
  validateStudentApplication,
  validateTutorApplication,
  validateTutorFiles,
};