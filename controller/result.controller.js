const Result = require('../models/result.model');

const getAllResults = async (req, res) => {
    try {
        const results = await Result.find().populate('student course');
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getResultById = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id).populate('student course');
        if (!result) return res.status(404).json({ message: 'Result not found' });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createResult = async (req, res) => {
    const { studentId, courseId, grade } = req.body;
    try {
        const newResult = new Result({ student: studentId, course: courseId, grade });
        const savedResult = await newResult.save();
        res.status(201).json(savedResult);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateResult = async (req, res) => {
    try {
        const updatedResult = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedResult) return res.status(404).json({ message: 'Result not found' });
        res.status(200).json(updatedResult);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteResult = async (req, res) => {
    try {
        const deletedResult = await Result.findByIdAndDelete(req.params.id);
        if (!deletedResult) return res.status(404).json({ message: 'Result not found' });
        res.status(200).json({ message: 'Result deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports= {
    getAllResults,
    createResult,
    getResultById,
    updateResult,
    deleteResult
}