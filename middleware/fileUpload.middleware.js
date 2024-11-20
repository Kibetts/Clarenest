
const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure file filter with specific mime types for each field
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        academicCertificates: ['application/pdf'],
        governmentId: ['application/pdf', 'image/jpeg', 'image/png']
    };

    if (allowedTypes[file.fieldname]?.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError(`Invalid file type for ${file.fieldname}. Please check the allowed formats.`, 400), false);
    }
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5 // Maximum 5 files per request
    }
});

// Export different upload configurations
module.exports = {
    single: upload.single.bind(upload),
    array: upload.array.bind(upload),
    fields: upload.fields.bind(upload),
    none: upload.none.bind(upload),
    tutorApplication: upload.fields([
        { name: 'cv', maxCount: 1 },
        { name: 'academicCertificates', maxCount: 5 },
        { name: 'governmentId', maxCount: 1 }
    ])
};