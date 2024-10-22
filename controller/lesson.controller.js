
const Lesson = require('../models/lesson.model');
const User = require('../models/user.model');
const { ROLES } = require('../config/roles');

exports.getAllLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find().populate('subject tutor students');
        res.status(200).json({
            status: 'success',
            results: lessons.length,
            data: {
                lessons
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('subject tutor students');
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.status(200).json({
            status: 'success',
            data: {
                lesson: lesson
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.createLesson = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can create lessons' });
        }

        const newLesson = await Lesson.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                lesson: newLesson
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateLesson = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can update lessons' });
        }

        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                lesson: lesson
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can delete lessons' });
        }

        const lesson = await Lesson.findByIdAndDelete(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
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

exports.enrollStudent = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const student = await User.findById(req.body.studentId);
        if (!student || student.role !== ROLES.STUDENT) {
            return res.status(400).json({ message: 'Invalid student' });
        }

        if (lesson.students.includes(student._id)) {
            return res.status(400).json({ message: 'Student already enrolled in this lesson' });
        }

        if (lesson.currentEnrollment >= lesson.capacity) {
            return res.status(400).json({ message: 'Lesson is at full capacity' });
        }

        lesson.students.push(student._id);
        lesson.currentEnrollment += 1;
        await lesson.save();

        res.status(200).json({
            status: 'success',
            message: 'Student enrolled successfully',
            data: {
                lesson: lesson
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};