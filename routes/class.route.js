const express = require('express');
const router = express.Router();
const classController = require('../controllers/class.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, classController.getAllClasses);
router.get('/:id', authMiddleware, classController.getClassById);
router.post('/', authMiddleware, classController.createClass);
router.put('/:id', authMiddleware, classController.updateClass);
router.delete('/:id', authMiddleware, classController.deleteClass);

module.exports = router;
