const Attendance = require('../models/attendance.model');

const getAllAttendance = async (req, res)=>{
    try {
        const attendance = Attendance.find.populate('student class');
        res.status(200).json(attendance);
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}

const getAttendanceById = async (req, res)=>{
    req.params.id= id;
    try {
        const attendance = await Attendance.findById(id).populate('student class');
        if(!attendance)
            return res.status(404).json('attendance not found');
        res.status(200).json(attendance);
    } catch (error) {
        res.status(400).json({error:error.message});
    };
};

const createAttendance = async (req, res)=>{
    const {studentId, classId, date, status} = req.body;
    try {
        const newattendance = new Attendance({student:studentId, class:classId, date, status});
        const savedAttendance = await newattendance.save();
        res.status(201).json(savedAttendance)
    } catch (error) {
        res.status(400).json({message:error.message});
    }
}

const updateAttendance = async (req, res) => {
    try {
        const updatedAttendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAttendance) 
            return res.status(404).json({ message: 'Attendance record not found' });
        res.status(200).json(updatedAttendance);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);
        if (!deletedAttendance) return res.status(404).json({ message: 'Attendance record not found' });
        res.status(200).json({ message: 'Attendance record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports={
    getAllAttendance,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance
}