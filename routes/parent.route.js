const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parent.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, parentController.getAllParents);
router.get('/:id', authMiddleware, parentController.getParentById);
router.post('/', authMiddleware, parentController.createParent);
router.put('/:id', authMiddleware, parentController.updateParent);
router.delete('/:id', authMiddleware, parentController.deleteParent);

module.exports = router;
