const Class = require('../models/class.model');

const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find().populate('course students tutor');
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getClassById = async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id).populate('course students tutor');
        if (!classItem) return res.status(404).json({ message: 'Class not found' });
        res.status(200).json(classItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createClass = async (req, res) => {
    const { name, courseId, tutorId } = req.body;
    try {
        const newClass = new Class({ name, course: courseId, tutor: tutorId });
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateClass = async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedClass) return res.status(404).json({ message: 'Class not found' });
        res.status(200).json(updatedClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) return res.status(404).json({ message: 'Class not found' });
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports ={
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass
}