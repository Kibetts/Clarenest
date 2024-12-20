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

        if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.TUTOR) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }
      // Add validation for required fields
      const { title, description, dueDate, subject, totalPoints, instructions } = req.body;
      
      // Validate required fields
      if (!title || !description || !dueDate || !subject || !totalPoints || !instructions) {
        return res.status(400).json({
          status: 'fail',
          message: 'Missing required fields'
        });
      }
  
      // Create the assignment
    //   const assignment = await Assignment.create({
    //     title,
    //     description,
    //     dueDate,
    //     subject,
    //     totalPoints,
    //     instructions,
    //     tutor: req.user._id
    //   });
    const assignment = await Assignment.create({
        ...req.body,
        tutor: req.user._id 
    });

      res.status(201).json({
        status: 'success',
        data: {
          assignment
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message || 'Failed to create assignment'
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
