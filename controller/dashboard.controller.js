// const Student = require('../models/student.model');
// const Tutor = require('../models/tutor.model');
// const Parent = require('../models/parent.model');
// const Class = require('../models/lesson.model');
// const Course = require('../models/subject.model');
// const User = require('../models/user.model');
// const Assignment = require('../models/assignment.model');
// const Result = require('../models/result.model');

// exports.getStudentDashboard = async (req, res) => {
//     const student = await Student.findById(req.user.id).populate('courses');
//     const upcomingClasses = await Class.find({ students: req.user.id, date: { $gt: new Date() } })
//         .sort('date')
//         .limit(5)
//         .populate('course tutor');
//     const recentAssignments = await Assignment.find({ 'submissions.student': req.user.id })
//         .sort('-dueDate')
//         .limit(5)
//         .populate('class');
//     const recentResults = await Result.find({ student: req.user.id })
//         .sort('-issuedDate')
//         .limit(5)
//         .populate('course');

//     res.status(200).json({
//         status: 'success',
//         data: {
//             student,
//             upcomingClasses,
//             recentAssignments,
//             recentResults,
//             enrolledCoursesCount: student.courses.length,
//             completedCoursesCount: student.courses.filter(course => course.status === 'completed').length
//         }
//     });
// };

// exports.getTutorDashboard = async (req, res) => {
//     const tutor = await Tutor.findById(req.user.id);
//     const upcomingClasses = await Class.find({ tutor: req.user.id, date: { $gt: new Date() } })
//         .sort('date')
//         .limit(5)
//         .populate('course');
//     const totalStudents = await Student.countDocuments({ 'courses.tutor': req.user.id });
//     const recentAssignments = await Assignment.find({ tutor: req.user.id })
//         .sort('-createdAt')
//         .limit(5)
//         .populate('class');
//     const classesTaught = await Class.countDocuments({ tutor: req.user.id });

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tutor,
//             upcomingClasses,
//             totalStudents,
//             recentAssignments,
//             classesTaught,
//             averageRating: tutor.rating
//         }
//     });
// };

// exports.getParentDashboard = async (req, res) => {
//     const parent = await Parent.findById(req.user.id).populate('children');
//     const childrenProgress = await Promise.all(parent.children.map(async (child) => {
//         const courses = await Course.find({ students: child._id });
//         const recentResults = await Result.find({ student: child._id })
//             .sort('-issuedDate')
//             .limit(3)
//             .populate('course');
//         return { child, courses, recentResults };
//     }));

//     const upcomingClasses = await Class.find({ 
//         students: { $in: parent.children.map(child => child._id) },
//         date: { $gt: new Date() }
//     })
//     .sort('date')
//     .limit(5)
//     .populate('course tutor');

//     res.status(200).json({
//         status: 'success',
//         data: {
//             parent,
//             childrenProgress,
//             upcomingClasses,
//             totalChildren: parent.children.length
//         }
//     });
// };

// exports.getAdminDashboard = async (req, res) => {
//     const totalStudents = await User.countDocuments({ role: 'student' });
//     const totalTutors = await User.countDocuments({ role: 'tutor' });
//     const totalCourses = await Course.countDocuments();
//     const recentUsers = await User.find().sort('-createdAt').limit(5);
//     const popularCourses = await Course.aggregate([
//         { $project: { title: 1, studentCount: { $size: "$students" } } },
//         { $sort: { studentCount: -1 } },
//         { $limit: 5 }
//     ]);
//     const revenue = await Result.aggregate([
//         { $group: { _id: null, total: { $sum: "$course.price" } } }
//     ]);

//     res.status(200).json({
//         status: 'success',
//         data: {
//             totalStudents,
//             totalTutors,
//             totalCourses,
//             recentUsers,
//             popularCourses,
//             revenue: revenue[0]?.total || 0,
//             courseCompletionRate: (await Course.countDocuments({ status: 'completed' }) / totalCourses) * 100
//         }
//     });
// };

// exports.getStudentDashboard = async (req, res) => {
//     const student = await Student.findById(req.user.id).populate('subjects');
//     const upcomingLessons = await Lesson.find({ students: req.user.id, date: { $gt: new Date() } })
//         .sort('date')
//         .limit(5)
//         .populate('subject tutor');
//     const recentAssignments = await Assignment.find({ 'submissions.student': req.user.id })
//         .sort('-dueDate')
//         .limit(5)
//         .populate('lesson');
//     const recentResults = await Result.find({ student: req.user.id })
//         .sort('-issuedDate')
//         .limit(5)
//         .populate('subject');

//     res.status(200).json({
//         status: 'success',
//         data: {
//             student,
//             upcomingLessons,
//             recentAssignments,
//             recentResults,
//             enrolledSubjectsCount: student.subjects.length,
//             completedSubjectsCount: student.subjects.filter(subject => subject.status === 'completed').length
//         }
//     });
// };


const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const Parent = require('../models/parent.model');
const Lesson = require('../models/lesson.model');
const Subject = require('../models/subject.model');
const User = require('../models/user.model');
const Assignment = require('../models/assignment.model');
const Result = require('../models/result.model');
const Attendance = require('../models/attendance.model');


exports.getStudentDashboard = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id)
            .populate('grade')
            .populate('subjects');

        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        // Upcoming assessments
        const upcomingAssessments = await Assessment.find({
            gradeLevel: student.grade,
            isActive: true,
            dueDate: { $gte: new Date() }
        }).populate('subject').limit(5);

        // Recent assessment submissions
        const recentSubmissions = await AssessmentSubmission.find({ student: student._id })
            .sort('-submittedAt')
            .populate('assessment')
            .limit(5);

        // Upcoming lessons
        const upcomingLessons = await Lesson.find({
            students: student._id,
            startTime: { $gte: new Date() }
        }).populate('subject').populate('tutor').sort('startTime').limit(5);

        // Recent attendance records
        const recentAttendance = await Attendance.find({
            'attendees.student': student._id
        }).sort('-date').limit(5);

        // Calculate overall attendance percentage
        const allAttendance = await Attendance.find({ 'attendees.student': student._id });
const presentAttendances = allAttendance.filter(a => 
    a.attendees.some(att => 
        att.student.toString() === student._id.toString() && 
        att.status === 'Present'
    )
);
const attendancePercentage = allAttendance.length > 0
    ? (presentAttendances.length / allAttendance.length) * 100
    : 0;

        // Calculate overall grade
        const allSubmissions = await AssessmentSubmission.find({ student: student._id });
        const overallGrade = allSubmissions.length > 0
            ? allSubmissions.reduce((sum, submission) => sum + submission.score, 0) / allSubmissions.length
            : 0;

        // Get subject progress
        const subjectProgress = await Promise.all(student.subjects.map(async (subject) => {
            const subjectSubmissions = await AssessmentSubmission.find({
                student: student._id,
                assessment: { $in: await Assessment.find({ subject: subject._id }) }
            });
            const averageScore = subjectSubmissions.length > 0
                ? subjectSubmissions.reduce((sum, submission) => sum + submission.score, 0) / subjectSubmissions.length
                : 0;
            return {
                subject: subject.title,
                averageScore,
                assessmentsTaken: subjectSubmissions.length
            };
        }));

        res.status(200).json({
            status: 'success',
            data: {
                student: {
                    name: student.name,
                    grade: student.grade,
                    subjects: student.subjects.map(s => s.title)
                },
                upcomingAssessments,
                recentSubmissions,
                upcomingLessons,
                recentAttendance,
                statistics: {
                    attendancePercentage,
                    overallGrade,
                    subjectProgress
                }
            }
        });
    } catch (err) {
        next(new AppError('Error fetching student dashboard', 500));
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
            isActive: true
        }).populate('subject');

        const submissions = await AssessmentSubmission.find({ student: student._id })
            .populate('assessment');

        res.status(200).json({
            status: 'success',
            data: {
                assessments,
                submissions
            }
        });
    } catch (err) {
        next(new AppError('Error fetching student assessments', 500));
    }
};

exports.getStudentAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.find({
            'attendees.student': req.user._id
        }).sort('-date').populate('lesson');

        res.status(200).json({
            status: 'success',
            data: {
                attendance
            }
        });
    } catch (err) {
        next(new AppError('Error fetching student attendance', 500));
    }
};

exports.getStudentSchedule = async (req, res, next) => {
    try {
        const lessons = await Lesson.find({
            students: req.user._id
        }).populate('subject').populate('tutor').sort('startTime');

        res.status(200).json({
            status: 'success',
            data: {
                lessons
            }
        });
    } catch (err) {
        next(new AppError('Error fetching student schedule', 500));
    }
};

exports.getTutorDashboard = async (req, res) => {
    const tutor = await Tutor.findById(req.user.id);
    const upcomingLessons = await Lesson.find({ tutor: req.user.id, date: { $gt: new Date() } })
        .sort('date')
        .limit(5)
        .populate('subject');
    const totalStudents = await Student.countDocuments({ 'subjects.tutor': req.user.id });
    const recentAssignments = await Assignment.find({ tutor: req.user.id })
        .sort('-createdAt')
        .limit(5)
        .populate('lesson');
    const lessonsTaught = await Lesson.countDocuments({ tutor: req.user.id });

    res.status(200).json({
        status: 'success',
        data: {
            tutor,
            upcomingLessons,
            totalStudents,
            recentAssignments,
            lessonsTaught,
            averageRating: tutor.rating
        }
    });
};

exports.getParentDashboard = async (req, res) => {
    try {
        const parent = await Parent.findById(req.user.id).populate('children');
        const childrenProgress = await Promise.all(parent.children.map(async (child) => {
            const subjects = await Subject.find({ students: child._id });
            const upcomingAssessments = await Assessment.find({
                gradeLevel: child.grade,
                isActive: true,
                dueDate: { $gt: new Date() }
            }).populate('subject');
            const recentSubmissions = await AssessmentSubmission.find({ student: child._id })
                .sort('-submittedAt')
                .limit(3)
                .populate('assessment');
            return { child, subjects, upcomingAssessments, recentSubmissions };
        }));

        res.status(200).json({
            status: 'success',
            data: {
                parent,
                childrenProgress,
                subjects,
                upcomingAssessments,
                recentSubmissions,
                totalChildren: parent.children.length
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getAdminDashboard = async (req, res) => {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTutors = await User.countDocuments({ role: 'tutor' });
    const totalSubjects = await Subject.countDocuments();
    const recentUsers = await User.find().sort('-createdAt').limit(5);
    const popularSubjects = await Subject.aggregate([
        { $project: { title: 1, studentCount: { $size: "$students" } } },
        { $sort: { studentCount: -1 } },
        { $limit: 5 }
    ]);
    const revenue = await Result.aggregate([
        { $group: { _id: null, total: { $sum: "$subject.price" } } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            totalStudents,
            totalTutors,
            totalSubjects,
            recentUsers,
            popularSubjects,
            revenue: revenue[0]?.total || 0,
            subjectCompletionRate: (await Subject.countDocuments({ status: 'completed' }) / totalSubjects) * 100
        }
    });
};