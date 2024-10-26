const express = require('express');
const documentController = require('../controller/document.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const uploadMiddleware = require('../middleware/fileUpload.middleware');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .post(
        authorizeRoles(ROLES.ADMIN), 
        uploadMiddleware.single('file'), 
        documentController.uploadDocument
    )
    .get(authorizeRoles(ROLES.PARENT), documentController.getDocuments);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.PARENT), documentController.getDocument)
    .delete(authorizeRoles(ROLES.ADMIN), documentController.deleteDocument);

router
    .route('/:id/download')
    .get(authorizeRoles(ROLES.PARENT), documentController.downloadDocument);

module.exports = router;