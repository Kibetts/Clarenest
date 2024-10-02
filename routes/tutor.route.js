const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutor.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, tutorController.getAllTutors);
router.get('/:id', authMiddleware, tutorController.getTutorById);
router.post('/', authMiddleware, tutorController.createTutor);
router.put('/:id', authMiddleware, tutorController.updateTutor);
router.delete('/:id', authMiddleware, tutorController.deleteTutor);

module.exports = router;
