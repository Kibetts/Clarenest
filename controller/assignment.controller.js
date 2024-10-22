// const Assignment = require('../models/assignment.model');
// const { ROLES } = require('../config/roles');

// exports.getAllAssignments = async (req, res) => {
//     try {
//         const assignments = await Assignment.find().populate('class tutor');
//         res.status(200).json({
//             status: 'success',
//             results: assignments.length,
//             data: {
//                 assignments
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'error',
//             message: err.message
//         });
//     }
// };

// exports.getAssignment = async (req, res) => {
//     try {
//         const assignment = await Assignment.findById(req.params.id).populate('class tutor');
//         if (!assignment) {
//             return res.status(404).json({ message: 'Assignment not found' });
//         }
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 assignment
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'error',
//             message: err.message
//         });
//     }
// };

// exports.createAssignment = async (req, res) => {
//     try {
//         if (![ROLES.ADMIN, ROLES.TUTOR].includes(req.user.role)) {
//             return res.status(403).json({ message: 'Only admins and tutors can create assignments' });
//         }

//         const newAssignment = await Assignment.create({
//             ...req.body,
//             tutor: req.user._id
//         });
        
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 assignment: newAssignment
//             }
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

// exports.updateAssignment = async (req, res) => {
//     try {
//         const assignment = await Assignment.findById(req.params.id);

//         if (!assignment) {
//             return res.status(404).json({ message: 'Assignment not found' });
//         }

//         if (![ROLES.ADMIN, ROLES.TUTOR].includes(req.user.role) || 
//             (req.user.role === ROLES.TUTOR && assignment.tutor.toString() !== req.user._id.toString())) {
//             return res.status(403).json({ message: 'You do not have permission to update this assignment' });
//         }

//         Object.assign(assignment, req.body);
//         await assignment.save();

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 assignment
//             }
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

// exports.deleteAssignment = async (req, res) => {
//     try {
//         const assignment = await Assignment.findById(req.params.id);

//         if (!assignment) {
//             return res.status(404).json({ message: 'Assignment not found' });
//         }

//         if (![ROLES.ADMIN, ROLES.TUTOR].includes(req.user.role) || 
//             (req.user.role === ROLES.TUTOR && assignment.tutor.toString() !== req.user._id.toString())) {
//             return res.status(403).json({ message: 'You do not have permission to delete this assignment' });
//         }

//         await assignment.remove();

//         res.status(204).json({
//             status: 'success',
//             data: null
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'error',
//             message: err.message
//         });
//     }
// };

// exports.submitAssignment = async (req, res) => {
//     try {
//         const assignment = await Assignment.findById(req.params.id);
//         if (!assignment) {
//             return res.status(404).json({ message: 'Assignment not found' });
//         }

//         const submission = {
//             student: req.user.id,
//             content: req.body.content,
//             files: req.files.map(file => ({
//                 filename: file.originalname,
//                 path: file.path,
//                 mimetype: file.mimetype
//             }))
//         };

//         assignment.submissions.push(submission);
//         await assignment.save();

//         res.status(201).json({
//             status: 'success',
//             data: {
//                 submission
//             }
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

const Assignment = require('../models/assignment.model');
const { ROLES } = require('../config/roles');

exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().populate('lesson tutor');
        res.status(200).json({
            status: 'success',
            results: assignments.length,
            data: {
                assignments
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('lesson tutor');
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json({
            status: 'success',
            data: {
                assignment
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.createAssignment = async (req, res) => {
    try {
        if (![ROLES.ADMIN, ROLES.TUTOR].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only admins and tutors can create assignments' });
        }

        const newAssignment = await Assignment.create({
            ...req.body,
            tutor: req.user._id
        });
        
        res.status(201).json({
            status: 'success',
            data: {
                assignment: newAssignment
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (![ROLES.ADMIN, ROLES.TUTOR].includes(req.user.role) || 
            (req.user.role === ROLES.TUTOR && assignment.tutor.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'You do not have permission to update this assignment' });
        }

        Object.assign(assignment, req.body);
        await assignment.save();

        res.status(200).json({
            status: 'success',
            data: {
                assignment
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (![ROLES.ADMIN, ROLES.TUTOR].includes(req.user.role) || 
            (req.user.role === ROLES.TUTOR && assignment.tutor.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'You do not have permission to delete this assignment' });
        }

        await assignment.remove();

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.submitAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submission = {
            student: req.user.id,
            content: req.body.content,
            files: req.files.map(file => ({
                filename: file.originalname,
                path: file.path,
                mimetype: file.mimetype
            }))
        };

        assignment.submissions.push(submission);
        await assignment.save();

        res.status(201).json({
            status: 'success',
            data: {
                submission
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
