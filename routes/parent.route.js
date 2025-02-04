const express = require('express');
const parentController = require('../controller/parent.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

// Public routes - no authentication needed
router.post('/create-account/:token', parentController.createParentAccount);

// Protected routes
router.use(authenticateJWT);

router
    .route('/')
    .get(authorizeRoles(ROLES.ADMIN), parentController.getAllParents);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.PARENT), parentController.getParent)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.PARENT), parentController.updateParent)
    .delete(authorizeRoles(ROLES.ADMIN), parentController.deleteParent);

router
    .route('/:id/children')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.PARENT), parentController.getParentChildren);

router
    .route('/:id/finances')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.PARENT), parentController.getParentFinances)
    .patch(authorizeRoles(ROLES.ADMIN), parentController.updateParentFinances);

router.get(
    '/child/:childId/assessments',
    authorizeRoles(ROLES.PARENT),
    parentController.getChildAssessments
);

module.exports = router;