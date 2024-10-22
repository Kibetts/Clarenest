const Parent = require('../models/parent.model');
const Student = require('../models/student.model');
const AppError = require('../utils/appError');


exports.getAllParents = async (req, res, next) => {
    const parents = await Parent.find().select('-password');

    res.status(200).json({
        status: 'success',
        results: parents.length,
        data: { parents }
    });
};

exports.createParent = async (req, res, next) => {
    const newParent = await Parent.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { parent: newParent }
    });
};

exports.getParent = async (req, res, next) => {
    const parent = await Parent.findById(req.params.id).select('-password');

    if (!parent) {
        return next(new AppError('No parent found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { parent }
    });
};

exports.updateParent = async (req, res, next) => {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).select('-password');

    if (!parent) {
        return next(new AppError('No parent found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { parent }
    });
};

exports.deleteParent = async (req, res, next) => {
    const parent = await Parent.findByIdAndDelete(req.params.id);

    if (!parent) {
        return next(new AppError('No parent found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
};

exports.getParentChildren = async (req, res, next) => {
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
        return next(new AppError('No parent found with that ID', 404));
    }

    const children = await Student.find({ _id: { $in: parent.children } }).select('-password');

    res.status(200).json({
        status: 'success',
        results: children.length,
        data: { children }
    });
};

exports.getChildAssessments = async (req, res, next) => {
    try {
        const child = await Student.findById(req.params.childId);
        if (!child) {
            return next(new AppError('Child not found', 404));
        }
        // Ensure the child belongs to the parent
        if (child.parent.toString() !== req.user._id.toString()) {
            return next(new AppError('You are not authorized to view this child\'s assessments', 403));
        }
        const assessments = await Assessment.find({
            gradeLevel: child.grade,
            isActive: true
        }).populate('subject');
        res.status(200).json({
            status: 'success',
            data: { assessments }
        });
    } catch (err) {
        next(new AppError('Error fetching child assessments', 500));
    }
};

exports.updateParentFinances = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id);
        if (!parent) {
            return next(new AppError('No parent found with that ID', 404));
        }

        const { amount, description } = req.body;
        parent.updateFinances(amount, description);
        await parent.save();

        res.status(200).json({
            status: 'success',
            data: { parent }
        });
    } catch (err) {
        next(err);
    }
};

exports.getParentFinances = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id);
        if (!parent) {
            return next(new AppError('No parent found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { finances: parent.finances }
        });
    } catch (err) {
        next(err);
    }
};