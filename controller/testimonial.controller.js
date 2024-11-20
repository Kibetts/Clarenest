const Testimonial = require('../models/testimonial.model');
const AppError = require('../utils/appError');

exports.getAllTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find({ status: 'approved' })
            .populate('author', 'name')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: testimonials.length,
            data: { testimonials }
        });
    } catch (err) {
        next(new AppError('Error fetching testimonials', 500));
    }
};

exports.createTestimonial = async (req, res, next) => {
    try {
        const newTestimonial = await Testimonial.create({
            ...req.body,
            author: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: { testimonial: newTestimonial }
        });
    } catch (err) {
        next(new AppError('Error creating testimonial', 400));
    }
};
