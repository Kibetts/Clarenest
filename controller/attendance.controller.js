const Attendance = require('../models/attendance.model');
const AppError = require('../utils/appError');

exports.getAllAttendances = async (req, res, next) => {
    const attendances = await Attendance.find().populate('lesson');
    res.status(200).json({
        status: 'success',
        results: attendances.length,
        data: { attendances }
    });
};

exports.createAttendance = async (req, res, next) => {
    const newAttendance = await Attendance.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { attendance: newAttendance }
    });
};

// Add this method to attendance.controller.js
exports.getStudentAttendance = async (req, res, next) => {
    try {
        const attendances = await Attendance.find({
            'attendees.student': req.user._id
        })
        .populate({
            path: 'lesson',
            populate: { path: 'subject tutor' }
        })
        .sort('-date');

        res.status(200).json({
            status: 'success',
            data: { attendances }
        });
    } catch (err) {
        next(new AppError('Error fetching student attendance', 500));
    }
};

exports.updateAttendance = async (req, res, next) => {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!attendance) {
        return next(new AppError('No attendance found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { attendance }
    });
};

exports.deleteAttendance = async (req, res, next) => {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
        return next(new AppError('No attendance found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
};

exports.getAttendanceByLesson = async (req, res, next) => {
    const attendances = await Attendance.find({ lesson: req.params.lessonId }).populate('lesson');
    res.status(200).json({
        status: 'success',
        results: attendances.length,
        data: { attendances }
    });
};
