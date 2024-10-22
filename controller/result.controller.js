const Result = require('../models/result.model');
const AppError = require('../utils/appError');


exports.getAllResults = async (req, res, next) => {
    const results = await Result.find().populate('student course');

    res.status(200).json({
        status: 'success',
        results: results.length,
        data: { results }
    });
};

exports.createResult = async (req, res, next) => {
    const newResult = await Result.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { result: newResult }
    });
};

exports.getResult = async (req, res, next) => {
    const result = await Result.findById(req.params.id).populate('student course');

    if (!result) {
        return next(new AppError('No result found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { result }
    });
};

exports.updateResult = async (req, res, next) => {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!result) {
        return next(new AppError('No result found with that ID', 404));
    }

    result.calculateOverallGrade();
    await result.save();

    res.status(200).json({
        status: 'success',
        data: { result }
    });
};

exports.deleteResult = async (req, res, next) => {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
        return next(new AppError('No result found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
};

exports.getStudentResults = async (req, res, next) => {
    const results = await Result.find({ student: req.params.studentId }).populate('course');

    res.status(200).json({
        status: 'success',
        results: results.length,
        data: { results }
    });
};
