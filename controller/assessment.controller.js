const Assessment = require('../models/assessment.model');
const Student = require('../models/student.model');
const AppError = require('../utils/appError');

exports.createAssessment = async (req, res, next) => {
    try {
        const newAssessment = await Assessment.create({
            ...req.body,
            creator: req.user._id
        });
        res.status(201).json({
            status: 'success',
            data: { assessment: newAssessment }
        });
    } catch (err) {
        next(new AppError('Error creating assessment', 400));
    }
};

exports.getAllAssessments = async (req, res, next) => {
    try {
        const assessments = await Assessment.find().populate('subject creator');
        res.status(200).json({
            status: 'success',
            data: { assessments }
        });
    } catch (err) {
        next(new AppError('Error fetching assessments', 500));
    }
};

exports.getAssessment = async (req, res, next) => {
    try {
        const assessment = await Assessment.findById(req.params.id).populate('subject creator');
        if (!assessment) {
            return next(new AppError('No assessment found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { assessment }
        });
    } catch (err) {
        next(new AppError('Error fetching assessment', 500));
    }
};

exports.updateAssessment = async (req, res, next) => {
    try {
        const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!assessment) {
            return next(new AppError('No assessment found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { assessment }
        });
    } catch (err) {
        next(new AppError('Error updating assessment', 400));
    }
};

exports.deleteAssessment = async (req, res, next) => {
    try {
        const assessment = await Assessment.findByIdAndDelete(req.params.id);
        if (!assessment) {
            return next(new AppError('No assessment found with that ID', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(new AppError('Error deleting assessment', 500));
    }
};

exports.getStudentAssessments = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id).populate('grade');
        if (!student) {
            return next(new AppError('Student not found', 404));
        }
        const assessments = await Assessment.find({
            gradeLevel: student.grade,
            isActive: true,
            dueDate: { $gte: new Date() }
        }).populate('subject');
        res.status(200).json({
            status: 'success',
            data: { assessments }
        });
    } catch (err) {
        next(new AppError('Error fetching student assessments', 500));
    }
};

exports.submitAssessment = async (req, res, next) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return next(new AppError('Assessment not found', 404));
        }

        // Check if the assessment is still active and not past due date
        if (!assessment.isActive || assessment.dueDate < new Date()) {
            return next(new AppError('This assessment is no longer available for submission', 400));
        }

        // Check if the student has already submitted this assessment
        const existingSubmission = await AssessmentSubmission.findOne({
            assessment: assessment._id,
            student: req.user._id
        });

        if (existingSubmission) {
            return next(new AppError('You have already submitted this assessment', 400));
        }

        // Validate that all questions are answered
        if (!req.body.answers || req.body.answers.length !== assessment.questions.length) {
            return next(new AppError('Please answer all questions', 400));
        }

        // Create new submission
        const submission = new AssessmentSubmission({
            assessment: assessment._id,
            student: req.user._id,
            answers: req.body.answers
        });

        // Grade the submission
        let score = 0;
        assessment.questions.forEach((question, index) => {
            if (question.correctAnswer === submission.answers[index].selectedAnswer) {
                score++;
            }
        });

        submission.score = (score / assessment.questions.length) * 100;
        await submission.save();

        res.status(201).json({
            status: 'success',
            message: 'Assessment submitted successfully',
            data: {
                submission: {
                    id: submission._id,
                    score: submission.score
                }
            }
        });
    } catch (err) {
        next(new AppError('Error submitting assessment', 400));
    }
};

exports.getStudentAssessmentResults = async (req, res, next) => {
    try {
        const submissions = await AssessmentSubmission.find({ student: req.user._id })
            .populate({
                path: 'assessment',
                populate: { path: 'subject' }
            });

        res.status(200).json({
            status: 'success',
            data: { submissions }
        });
    } catch (err) {
        next(new AppError('Error fetching assessment results', 500));
    }
};

// *********************************************************
// exports.submitAssessment = async (req, res, next) => {
//     try {
//         const assessment = await Assessment.findById(req.params.id);
//         if (!assessment) {
//             return next(new AppError('Assessment not found', 404));
//         }

//         if (assessment.dueDate < new Date()) {
//             return next(new AppError('Assessment submission deadline has passed', 400));
//         }

//         const existingSubmission = await AssessmentSubmission.findOne({
//             assessment: assessment._id,
//             student: req.user._id
//         });

//         if (existingSubmission) {
//             return next(new AppError('You have already submitted this assessment', 400));
//         }

//         const submission = new AssessmentSubmission({
//             assessment: assessment._id,
//             student: req.user._id,
//             answers: req.body.answers
//         });

//         // Grade the submission
//         let score = 0;
//         assessment.questions.forEach((question, index) => {
//             if (question.correctAnswer === submission.answers[index].selectedAnswer) {
//                 score++;
//             }
//         });

//         submission.score = (score / assessment.questions.length) * 100;
//         await submission.save();

//         res.status(200).json({
//             status: 'success',
//             message: 'Assessment submitted successfully',
//             data: {
//                 score: submission.score
//             }
//         });
//     } catch (err) {
//         next(new AppError('Error submitting assessment', 400));
//     }
// };

// exports.getStudentAssessmentResults = async (req, res, next) => {
//     try {
//         const submissions = await AssessmentSubmission.find({ student: req.user._id })
//             .populate({
//                 path: 'assessment',
//                 populate: { path: 'subject' }
//             });

//         res.status(200).json({
//             status: 'success',
//             data: { submissions }
//         });
//     } catch (err) {
//         next(new AppError('Error fetching assessment results', 500));
//     }
// };