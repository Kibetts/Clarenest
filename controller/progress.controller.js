const Progress = require('../models/progress.model');
const AppError = require('../utils/appError');


exports.getAllProgresses = async (req, res, next) => {
    const progresses = await Progress.find().populate('student course');

    res.status(200).json({
        status: 'success',
        results: progresses.length,
        data: { progresses }
    });
};

exports.createProgress = async (req, res, next) => {
    const newProgress = await Progress.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { progress: newProgress }
    });
};

exports.getProgress = async (req, res, next) => {
    const progress = await Progress.findById(req.params.id).populate('student course');

    if (!progress) {
        return next(new AppError('No progress found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { progress }
    });
};

exports.updateProgress = async (req, res, next) => {
    const progress = await Progress.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!progress) {
        return next(new AppError('No progress found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { progress }
    });
};

exports.deleteProgress = async (req, res, next) => {
    const progress = await Progress.findByIdAndDelete(req.params.id);

    if (!progress) {
        return next(new AppError('No progress found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
};

exports.getStudentProgress = async (req, res, next) => {
    const progress = await Progress.find({ student: req.params.studentId }).populate('course');

    res.status(200).json({
        status: 'success',
        results: progress.length,
        data: { progress }
    });
};