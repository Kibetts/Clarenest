const Assignment = require('../models/assignment.model');

const getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().populate('class tutor');
        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('class tutor');
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.status(200).json(assignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createAssignment = async (req, res) => {
    const { title, description, dueDate, classId, tutorId } = req.body;
    try {
        const newAssignment = new Assignment({ title, description, dueDate, class: classId, tutor: tutorId });
        const savedAssignment = await newAssignment.save();
        res.status(201).json(savedAssignment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAssignment) return res.status(404).json({ message: 'Assignment not found' });
        res.status(200).json(updatedAssignment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
const deleteAssignment = async (req, res) => {
    try {
        const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) return res.status(404).json({ message: 'Assignment not found' });
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment
}