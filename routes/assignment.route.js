const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, assignmentController.getAllAssignments);
router.get('/:id', authMiddleware, assignmentController.getAssignmentById);
router.post('/', authMiddleware, assignmentController.createAssignment);
router.put('/:id', authMiddleware, assignmentController.updateAssignment);
router.delete('/:id', authMiddleware, assignmentController.deleteAssignment);

module.exports = router;
