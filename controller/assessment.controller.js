const Assessment = require('../models/assessment.model');
const Student = require('../models/student.model');
const AppError = require('../utils/appError');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

const generateAssessmentPDF = async (assessment) => {
    const doc = new PDFDocument();
    const filename = `assessment-${assessment._id}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../uploads/assessments', filename);

    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add assessment content to PDF
        doc.fontSize(16).text('Assessment', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Title: ${assessment.title}`);
        doc.moveDown();
        doc.text(`Subject: ${assessment.subject.name}`);
        doc.moveDown();

        // Add questions
        assessment.questions.forEach((question, index) => {
            doc.moveDown();
            doc.text(`Question ${index + 1}: ${question.question}`);
            question.options.forEach((option, optIndex) => {
                doc.text(`${String.fromCharCode(65 + optIndex)}) ${option}`);
            });
        });

        doc.end();

        stream.on('finish', () => {
            resolve({
                filename,
                path: filePath,
                mimetype: 'application/pdf'
            });
        });

        stream.on('error', reject);
    });
};

exports.distributeToParents = async (req, res, next) => {
    try {
        const { assessmentId, parentIds } = req.body;

        // Verify tutor's authority
        if (req.user.role !== 'tutor') {
            return next(new AppError('Only tutors can distribute assessments', 403));
        }

        const assessment = await Assessment.findById(assessmentId)
            .populate('subject');

        if (!assessment) {
            return next(new AppError('Assessment not found', 404));
        }

        // Generate PDF if it doesn't exist
        if (!assessment.assessmentFile) {
            const pdfFile = await generateAssessmentPDF(assessment);
            assessment.assessmentFile = pdfFile;
            await assessment.save();
        }

        // Distribute to each parent
        const distributionPromises = parentIds.map(async (parentId) => {
            const parent = await Parent.findById(parentId);
            if (!parent) {
                throw new AppError(`Parent with ID ${parentId} not found`, 404);
            }

            // Add to distribution list if not already distributed
            if (!assessment.distributedTo.find(dist => dist.parent.equals(parentId))) {
                assessment.distributedTo.push({
                    parent: parentId,
                    distributedAt: new Date()
                });
            }

            // Create notification
            await Notification.create({
                recipient: parentId,
                message: `New assessment available: ${assessment.title}`,
                type: 'Assessment',
                relatedItem: assessment._id,
                itemModel: 'Assessment'
            });

            // Send email notification
            await sendEmail({
                email: parent.email,
                subject: 'New Assessment Available',
                message: `A new assessment "${assessment.title}" has been shared with you. Please log in to your dashboard to download it.`,
                html: `
                    <h2>New Assessment Available</h2>
                    <p>Dear Parent,</p>
                    <p>A new assessment "${assessment.title}" has been shared with you by ${req.user.name}.</p>
                    <p>Please log in to your dashboard to download and administer this assessment to your child.</p>
                    <p>Assessment Details:</p>
                    <ul>
                        <li>Subject: ${assessment.subject.name}</li>
                        <li>Duration: ${assessment.duration} minutes</li>
                        <li>Total Questions: ${assessment.questions.length}</li>
                    </ul>
                    <p>Best regards,<br>Clarenest International School</p>
                `
            });
        });

        await Promise.all(distributionPromises);
        await assessment.save();

        res.status(200).json({
            status: 'success',
            message: 'Assessment distributed successfully',
            data: {
                distributedTo: assessment.distributedTo
            }
        });
    } catch (err) {
        next(new AppError('Error distributing assessment: ' + err.message, 500));
    }
};

exports.downloadAssessment = async (req, res, next) => {
    try {
        const { assessmentId } = req.params;
        const parent = req.user;

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return next(new AppError('Assessment not found', 404));
        }

        // Verify parent has access to this assessment
        const distribution = assessment.distributedTo.find(dist => 
            dist.parent.equals(parent._id)
        );

        if (!distribution) {
            return next(new AppError('You do not have access to this assessment', 403));
        }

        // Update download status
        distribution.downloaded = true;
        distribution.downloadedAt = new Date();
        await assessment.save();

        // Send file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${assessment.assessmentFile.filename}"`);
        
        const fileStream = fs.createReadStream(assessment.assessmentFile.path);
        fileStream.pipe(res);
    } catch (err) {
        next(new AppError('Error downloading assessment: ' + err.message, 500));
    }
};