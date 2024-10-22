const Tutor = require('../models/tutor.model');
const Lesson = require('../models/lesson.model');
const AppError = require('../utils/appError');

exports.getAllTutors = async (req, res, next) => {
    try {
        const tutors = await Tutor.find().select('-password');
        res.status(200).json({
            status: 'success',
            results: tutors.length,
            data: { tutors }
        });
    } catch (err) {
        next(new AppError('Error fetching tutors', 500));
    }
};

exports.createTutor = async (req, res, next) => {
    try {
        const newTutor = await Tutor.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { tutor: newTutor }
        });
    } catch (err) {
        next(new AppError('Error creating tutor', 400));
    }
};

exports.getTutor = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id).select('-password');
        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { tutor }
        });
    } catch (err) {
        next(new AppError('Error fetching tutor', 500));
    }
};

exports.updateTutor = async (req, res, next) => {
    try {
        const tutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { tutor }
        });
    } catch (err) {
        next(new AppError('Error updating tutor', 400));
    }
};

exports.deleteTutor = async (req, res, next) => {
    try {
        const tutor = await Tutor.findByIdAndDelete(req.params.id);

        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(new AppError('Error deleting tutor', 500));
    }
};

exports.getTutorLessons = async (req, res, next) => {
    try {
        const lessons = await Lesson.find({ tutor: req.params.id }).populate('subject');
        res.status(200).json({
            status: 'success',
            results: lessons.length,
            data: { lessons }
        });
    } catch (err) {
        next(new AppError('Error fetching tutor lessons', 500));
    }
};

exports.updateTutorStatus = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        const { status } = req.body;
        tutor.updateStatus(status);
        await tutor.save();

        res.status(200).json({
            status: 'success',
            data: { tutor }
        });
    } catch (err) {
        next(new AppError('Error updating tutor status', 400));
    }
};

exports.getTutorStatus = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { 
                status: tutor.status,
                lastActive: tutor.lastActive
            }
        });
    } catch (err) {
        next(new AppError('Error fetching tutor status', 500));
    }
};

exports.assignLessonToTutor = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        const { lessonId } = req.body;
        const lessonExists = await Lesson.findById(lessonId);
        if (!lessonExists) {
            return next(new AppError('No lesson found with that ID', 404));
        }

        tutor.assignClass(lessonId);
        await tutor.save();

        res.status(200).json({
            status: 'success',
            data: { tutor }
        });
    } catch (err) {
        next(new AppError('Error assigning lesson to tutor', 400));
    }
};

exports.removeLessonFromTutor = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        const { lessonId } = req.body;
        tutor.removeAssignedClass(lessonId);
        await tutor.save();

        res.status(200).json({
            status: 'success',
            data: { tutor }
        });
    } catch (err) {
        next(new AppError('Error removing lesson from tutor', 400));
    }
};

exports.getTutorReviews = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);

        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            results: tutor.reviews.length,
            data: { reviews: tutor.reviews }
        });
    } catch (err) {
        next(new AppError('Error fetching tutor reviews', 500));
    }
};

exports.addTutorReview = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);

        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        const newReview = {
            student: req.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        };

        tutor.reviews.push(newReview);
        tutor.calculateAverageRating();
        await tutor.save();

        res.status(201).json({
            status: 'success',
            data: { review: newReview }
        });
    } catch (err) {
        next(new AppError('Error adding tutor review', 400));
    }
};

exports.updateTutorReview = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);

        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        const review = tutor.reviews.id(req.params.reviewId);

        if (!review) {
            return next(new AppError('No review found with that ID', 404));
        }

        if (review.student.toString() !== req.user.id) {
            return next(new AppError('You can only update your own reviews', 403));
        }

        review.rating = req.body.rating || review.rating;
        review.comment = req.body.comment || review.comment;

        tutor.calculateAverageRating();
        await tutor.save();

        res.status(200).json({
            status: 'success',
            data: { review }
        });
    } catch (err) {
        next(new AppError('Error updating tutor review', 400));
    }
};

exports.deleteTutorReview = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);

        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        const reviewIndex = tutor.reviews.findIndex(review => review.id === req.params.reviewId);

        if (reviewIndex === -1) {
            return next(new AppError('No review found with that ID', 404));
        }

        if (tutor.reviews[reviewIndex].student.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('You can only delete your own reviews', 403));
        }

        tutor.reviews.splice(reviewIndex, 1);
        tutor.calculateAverageRating();
        await tutor.save();

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(new AppError('Error deleting tutor review', 500));
    }
};

exports.getTutorAvailability = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);

        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { availability: tutor.availability }
        });
    } catch (err) {
        next(new AppError('Error fetching tutor availability', 500));
    }
};

exports.updateTutorAvailability = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.params.id);

        if (!tutor) {
            return next(new AppError('No tutor found with that ID', 404));
        }

        if (req.user.id !== tutor.id.toString() && req.user.role !== 'admin') {
            return next(new AppError('You can only update your own availability', 403));
        }

        tutor.availability = req.body.availability;
        await tutor.save();

        res.status(200).json({
            status: 'success',
            data: { availability: tutor.availability }
        });
    } catch (err) {
        next(new AppError('Error updating tutor availability', 400));
    }
};