const Admin = require('../models/admin.model');
const Tutor = require('../models/tutor.model');
const Lesson = require('../models/lesson.model');
const Subject = require('../models/subject.model');

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.status(200).json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTutor = async (req, res) => {
    try {
        const newTutor = new Tutor(req.body);
        const savedTutor = await newTutor.save();
        res.status(201).json(savedTutor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const newSubject = new Subject(req.body);
        const savedSubject = await newSubject.save();
        res.status(201).json(savedSubject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.createLessonSchedule = async (req, res) => {
    try {
        const newLesson = new Lesson(req.body);
        const savedLesson = await newLesson.save();
        res.status(201).json(savedLesson);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');
        
        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        res.status(200).json(updatedAdmin);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
