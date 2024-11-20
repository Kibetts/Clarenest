const express = require('express');
const testimonialController = require('../controller/testimonial.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

router
    .route('/')
    .get(testimonialController.getAllTestimonials)
    .post(authenticateJWT, testimonialController.createTestimonial);

module.exports = router;