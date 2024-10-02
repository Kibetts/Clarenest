const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, resultController.getAllResults);
router.get('/:id', authMiddleware, resultController.getResultById);
router.post('/', authMiddleware, resultController.createResult);
router.put('/:id', authMiddleware, resultController.updateResult);
router.delete('/:id', authMiddleware, resultController.deleteResult);

module.exports = router;
