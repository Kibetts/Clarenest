// const Course = require('../models/subject.model');
// const { ROLES } = require('../config/roles');

// exports.getAllCourses = async (req, res) => {
//     try {
//         const courses = await Course.find().populate('tutor');
//         res.status(200).json({
//             status: 'success',
//             results: courses.length,
//             data: {
//                 courses
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'error',
//             message: err.message
//         });
//     }
// };

// exports.getCourse = async (req, res) => {
//     try {
//         const course = await Course.findById(req.params.id).populate('tutor');
//         if (!course) {
//             return res.status(404).json({ message: 'Course not found' });
//         }
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 course
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'error',
//             message: err.message
//         });
//     }
// };

// exports.createCourse = async (req, res) => {
//     try {
//         if (req.user.role !== ROLES.ADMIN) {
//             return res.status(403).json({ message: 'Only admins can create courses' });
//         }

//         const newCourse = await Course.create(req.body);
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 course: newCourse
//             }
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

// exports.updateCourse = async (req, res) => {
//     try {
//         if (req.user.role !== ROLES.ADMIN) {
//             return res.status(403).json({ message: 'Only admins can update courses' });
//         }

//         const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });

//         if (!course) {
//             return res.status(404).json({ message: 'Course not found' });
//         }

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 course
//             }
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

// exports.deleteCourse = async (req, res) => {
//     try {
//         if (req.user.role !== ROLES.ADMIN) {
//             return res.status(403).json({ message: 'Only admins can delete courses' });
//         }

//         const course = await Course.findByIdAndDelete(req.params.id);

//         if (!course) {
//             return res.status(404).json({ message: 'Course not found' });
//         }

//         res.status(204).json({
//             status: 'success',
//             data: null
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'error',
//             message: err.message
//         });
//     }
// };

const Subject = require('../models/subject.model');
const { ROLES } = require('../config/roles');

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().populate('tutor');
        res.status(200).json({
            status: 'success',
            results: subjects.length,
            data: {
                subjects
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('tutor');
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json({
            status: 'success',
            data: {
                subject
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.createSubject = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can create subjects' });
        }

        const newSubject = await Subject.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                subject: newSubject
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can update subjects' });
        }

        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                subject
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can delete subjects' });
        }

        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};