const Tutor = require('../models/tutor.model');


const getAllTutors = async (req, res) => {
    try {
        const tutors = await Tutor.find().populate('classes');
        res.status(200).json(tutors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getTutorById = async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id).populate('classes');
        if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
        res.status(200).json(tutor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const createTutor = async (req, res) => {
    const { name, email, password, subjects } = req.body;
    try {
        const newTutor = new Tutor({ name, email, password, subjects });
        const savedTutor = await newTutor.save();
        res.status(201).json(savedTutor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const updateTutor = async (req, res) => {
    try {
        const updatedTutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTutor) return res.status(404).json({ message: 'Tutor not found' });
        res.status(200).json(updatedTutor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const deleteTutor = async (req, res) => {
    try {
        const deletedTutor = await Tutor.findByIdAndDelete(req.params.id);
        if (!deletedTutor) return res.status(404).json({ message: 'Tutor not found' });
        res.status(200).json({ message: 'Tutor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports ={
    getAllTutors,
    getTutorById,
    createTutor,
    updateTutor,
    deleteTutor
}