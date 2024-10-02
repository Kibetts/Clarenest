const Parent = require('../models/parent.model');


const getAllParents = async (req, res) => {
    try {
        const parents = await Parent.find().populate('students finances');
        res.status(200).json(parents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getParentById = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id).populate('students finances');
        if (!parent) return res.status(404).json({ message: 'Parent not found' });
        res.status(200).json(parent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const createParent = async (req, res) => {
    const { name, email, password, students } = req.body;
    try {
        const newParent = new Parent({ name, email, password, students });
        const savedParent = await newParent.save();
        res.status(201).json(savedParent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const updateParent = async (req, res) => {
    try {
        const updatedParent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedParent) return res.status(404).json({ message: 'Parent not found' });
        res.status(200).json(updatedParent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const deleteParent = async (req, res) => {
    try {
        const deletedParent = await Parent.findByIdAndDelete(req.params.id);
        if (!deletedParent) return res.status(404).json({ message: 'Parent not found' });
        res.status(200).json({ message: 'Parent deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports ={
    getAllParents,
    getParentById,
    createParent,
    updateParent,
    deleteParent
}