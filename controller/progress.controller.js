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