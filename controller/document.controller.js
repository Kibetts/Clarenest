const Document = require('../models/document.model');
const AppError = require('../utils/appError');
const { uploadToS3, getSignedUrl } = require('../utils/s3');

exports.uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('No file uploaded', 400));
        }

        const fileUrl = await uploadToS3(req.file);

        const document = await Document.create({
            title: req.body.title,
            description: req.body.description,
            fileUrl,
            sender: req.user.id,
            recipients: req.body.recipients
        });

        res.status(201).json({
            status: 'success',
            data: { document }
        });
    } catch (err) {
        next(err);
    }
};

exports.getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.find({ recipients: req.user.id });

        res.status(200).json({
            status: 'success',
            results: documents.length,
            data: { documents }
        });
    } catch (err) {
        next(err);
    }
};

exports.getDocumentDownloadUrl = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return next(new AppError('No document found with that ID', 404));
        }

        if (!document.recipients.includes(req.user.id) && document.sender.toString() !== req.user.id) {
            return next(new AppError('You do not have permission to access this document', 403));
        }

        const downloadUrl = await getSignedUrl(document.fileUrl);

        res.status(200).json({
            status: 'success',
            data: { downloadUrl }
        });
    } catch (err) {
        next(err);
    }
};