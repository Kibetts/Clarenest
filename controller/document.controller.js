const Document = require('../models/document.model');
const AppError = require('../utils/appError');
const path = require('path');
const fs = require('fs').promises;

exports.uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('No file uploaded', 400));
        }

        const document = await Document.create({
            title: req.body.title,
            description: req.body.description,
            filePath: req.file.path.replace('uploads/', ''),
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            sender: req.user.id,
            recipients: req.body.recipients
        });

        res.status(201).json({
            status: 'success',
            data: { document }
        });
    } catch (err) {
        if (req.file) {
            // Clean up uploaded file if document creation fails
            await fs.unlink(req.file.path).catch(console.error);
        }
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

exports.downloadDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return next(new AppError('No document found with that ID', 404));
        }

        if (!document.recipients.includes(req.user.id) && document.sender.toString() !== req.user.id) {
            return next(new AppError('You do not have permission to access this document', 403));
        }

        const filePath = path.join(__dirname, '..', 'uploads', document.filePath);

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch (error) {
            return next(new AppError('Document file not found', 404));
        }

        // Set headers for file download
        res.setHeader('Content-Type', document.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);

        // Send file
        res.sendFile(filePath);
    } catch (err) {
        next(err);
    }
};

exports.getDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return next(new AppError('No document found with that ID', 404));
        }

        if (!document.recipients.includes(req.user.id) && document.sender.toString() !== req.user.id) {
            return next(new AppError('You do not have permission to access this document', 403));
        }

        res.status(200).json({
            status: 'success',
            data: { document }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return next(new AppError('No document found with that ID', 404));
        }

        if (document.sender.toString() !== req.user.id) {
            return next(new AppError('You do not have permission to delete this document', 403));
        }

        // Delete the file
        const filePath = path.join(__dirname, '..', 'uploads', document.filePath);
        await fs.unlink(filePath).catch(console.error);

        // Delete the document record
        await Document.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};