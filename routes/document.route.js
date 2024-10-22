const express = require('express');
const documentController = require('../controller/document.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const upload = require('../middleware/fileUpload.middleware');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .post(authorizeRoles(ROLES.ADMIN), upload.single('file'), documentController.uploadDocument)
    .get(authorizeRoles(ROLES.PARENT), documentController.getDocuments);

router
    .route('/:id/download')
    .get(authorizeRoles(ROLES.PARENT), documentController.getDocumentDownloadUrl);

module.exports = router;