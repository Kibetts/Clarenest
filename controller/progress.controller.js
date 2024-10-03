const Progress = require('../models/progress.model');

const getAllProgress = async (req, res)=>{
    try {
        const progress = await Progress.find.populate('student course');
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({error:err.message})
    }
}

const getProgressById = async (req, res)=>{
    try {
        const progress = await Progress.findByid(req.params.id).populate('student course')
        if(!progress) 
            return res.status(404).json({message: 'progress not found'})
        res.status(200).json(progress)
    } catch (error) {
        res.status(500).json({error:err.message})
    }
}

const createProgress = async (req, res)=>{
    const {studentId, courseId, status} = req.body
    try {
        const newProgress = new Progress({student:studentId, course:courseId, status});
        const savedProgress = await newProgress.save();
        res.status(201).json(savedProgress);
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}

const updateProgress = async (req, res)=>{
    try {
        const updatedProgress = await Progress.findByIdAndUpdate(req.params.id, req.body, {new:true});
    if(!updatedProgress) return res.status(400).json({message:'progress not found'});
        res.status(200).json({message:'progress updated successfully'});
    } catch (error) {
        res.status(404).json({error:error.message});
    }
}

const deleteProgress = async (req, res)=>{
    try {
        const deletedProgress = await Progress.findByIdAndDelete(req.params.id);
        if(!deletedProgress) 
            return res.status(400).json({message:'progress not found'});
        res.status(200).json({message:'progress deleted successfuly'})
    } catch (error) {
        res.status(404).json({error:error.message});
    }
}

module.exports={
    getAllProgress,
    getProgressById,
    createProgress,
    updateProgress,
    deleteProgress
}