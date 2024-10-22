const Schedule = require('../models/schedule.model');
const Lesson = require('../models/lesson.model');

exports.getSchedule = async (req, res) => {
    try {
        let schedule;
        if (req.user.role === 'student') {
            const studentLessons = await Lesson.find({ students: req.user.id });
            const lessonIds = studentLessons.map(c => c._id);
            schedule = await Schedule.find({ lesson: { $in: lessonIds } }).populate('lesson');
        } else if (req.user.role === 'tutor') {
            const tutorLessons = await Lesson.find({ tutor: req.user.id });
            const lessonIds = tutorLessons.map(c => c._id);
            schedule = await Schedule.find({ lesson: { $in: lessonIds } }).populate('lesson');
        } else {
            schedule = await Schedule.find().populate('lesson');
        }
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const { lessonId, dayOfWeek, startTime, endTime } = req.body;
        const newSchedule = new Schedule({ lesson: lessonId, dayOfWeek, startTime, endTime });
        await newSchedule.save();
        res.status(201).json({ message: 'Schedule created successfully', data: newSchedule });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json({ message: 'Schedule updated successfully', data: updatedSchedule });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!deletedSchedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json({ message: 'Schedule deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};