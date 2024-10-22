
// const Student = require('../models/student.model');
// const Class = require('../models/lesson.model');
// const Attendance = require('../models/attendance.model');
// const AppError = require('../utils/appError');


// exports.getAllStudents = async (req, res, next) => {
//     const students = await Student.find().select('-password');

//     res.status(200).json({
//         status: 'success',
//         results: students.length,
//         data: { students }
//     });
// };

// exports.createStudent = async (req, res, next) => {
//     const newStudent = await Student.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: { student: newStudent }
//     });
// };

// exports.getStudent = async (req, res, next) => {
//     const student = await Student.findById(req.params.id).select('-password');

//     if (!student) {
//         return next(new AppError('No student found with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: { student }
//     });
// };

// exports.updateStudent = async (req, res, next) => {
//     const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     }).select('-password');

//     if (!student) {
//         return next(new AppError('No student found with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: { student }
//     });
// };

// exports.deleteStudent = async (req, res, next) => {
//     const student = await Student.findByIdAndDelete(req.params.id);

//     if (!student) {
//         return next(new AppError('No student found with that ID', 404));
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// };

// exports.getStudentCourses = async (req, res, next) => {
//     const student = await Student.findById(req.params.id).populate('courses');

//     if (!student) {
//         return next(new AppError('No student found with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         results: student.courses.length,
//         data: { courses: student.courses }
//     });
// };

// exports.getStudentAttendance = async (req, res, next) => {
//     const attendance = await Attendance.find({ 'attendees.student': req.params.id }).populate('class');

//     res.status(200).json({
//         status: 'success',
//         results: attendance.length,
//         data: { attendance }
//     });
// };

// exports.updateStudentStatus = async (req, res, next) => {
//     try {
//         const student = await Student.findById(req.params.id);
//         if (!student) {
//             return next(new AppError('No student found with that ID', 404));
//         }

//         const { status } = req.body;
//         student.updateStatus(status);
//         await student.save();

//         res.status(200).json({
//             status: 'success',
//             data: { student }
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// exports.getStudentStatus = async (req, res, next) => {
//     try {
//         const student = await Student.findById(req.params.id);
//         if (!student) {
//             return next(new AppError('No student found with that ID', 404));
//         }

//         res.status(200).json({
//             status: 'success',
//             data: { 
//                 status: student.status,
//                 lastActive: student.lastActive
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// };

const Student = require('../models/student.model');
const Subject = require('../models/subject.model');
const Attendance = require('../models/attendance.model');
const AppError = require('../utils/appError');

exports.getAllStudents = async (req, res, next) => {
    const students = await Student.find().select('-password');

    res.status(200).json({
        status: 'success',
        results: students.length,
        data: { students }
    });
};

exports.createStudent = async (req, res, next) => {
    const newStudent = await Student.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { student: newStudent }
    });
};

exports.getStudent = async (req, res, next) => {
    const student = await Student.findById(req.params.id).select('-password');

    if (!student) {
        return next(new AppError('No student found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { student }
    });
};

exports.updateStudent = async (req, res, next) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).select('-password');

    if (!student) {
        return next(new AppError('No student found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { student }
    });
};

exports.deleteStudent = async (req, res, next) => {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
        return next(new AppError('No student found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
};

exports.getStudentSubjects = async (req, res, next) => {
    const student = await Student.findById(req.params.id).populate('subjects');

    if (!student) {
        return next(new AppError('No student found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        results: student.subjects.length,
        data: { subjects: student.subjects }
    });
};

exports.getStudentAttendance = async (req, res, next) => {
    const attendance = await Attendance.find({ 'attendees.student': req.params.id }).populate('lesson');

    res.status(200).json({
        status: 'success',
        results: attendance.length,
        data: { attendance }
    });
};

exports.updateStudentStatus = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return next(new AppError('No student found with that ID', 404));
        }

        const { status } = req.body;
        student.updateStatus(status);
        await student.save();

        res.status(200).json({
            status: 'success',
            data: { student }
        });
    } catch (err) {
        next(err);
    }
};

exports.getStudentStatus = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return next(new AppError('No student found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { 
                status: student.status,
                lastActive: student.lastActive
            }
        });
    } catch (err) {
        next(err);
    }
};