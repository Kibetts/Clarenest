const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, progressController.getAllProgresses);
router.get('/:id', authMiddleware, progressController.getProgressById);
router.post('/', authMiddleware, progressController.createProgress);
router.put('/:id', authMiddleware, progressController.updateProgress);
router.delete('/:id', authMiddleware, progressController.deleteProgress);

module.exports = router;
