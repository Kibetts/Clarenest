const Student = require('../models/student.model');

// Get All Students
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('class assignments attendance grades notifications');
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get one student
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('class assignments attendance grades notifications');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a Student
const createStudent = async (req, res) => {
    const { name, email, password, classId } = req.body;
    try {
        const newStudent = new Student({ name, email, password, class: classId });
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a Student details
const updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(updatedStudent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a Student
const deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};






module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
}