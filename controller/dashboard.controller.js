const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const Parent = require('../models/parent.model');
const Admin = require('../models/admin.model');
const Lesson = require('../models/lesson.model');
const Assignment = require('../models/assignment.model');
const Assessment = require('../models/assessment.model');
const Result = require('../models/result.model');
const Attendance = require('../models/attendance.model');
const Message = require('../models/message.model');
const CourseMaterial = require('../models/courseMaterial.model');
const Announcement = require('../models/announcement.model');
const StudentApplication = require('../models/studentApplication.model');
const TutorApplication = require('../models/tutorApplication.model');
const User = require('../models/user.model');
const FeePayment = require('../models/feePayment.model');
const Notification = require('../models/notification.model');
const AppError = require('../utils/appError');

exports.getStudentDashboard = async (req, res, next) => {
    try {
        // First attempt to find the student by querying the User model with proper discrimination
        let student = await User.findOne({ _id: req.user._id, role: 'student' });
        
        if (!student) {
            // If not found, update the existing User document to include student fields
            student = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        role: 'student',
                        grade: req.user.grade,
                        subjects: [],
                        status: "offline",
                        lastActive: new Date(),
                        enrollmentDate: req.user.createdAt,
                        feeStatus: req.user.feeStatus,
                        totalFees: req.user.totalFees,
                        paidFees: req.user.paidFees,
                        __t: 'Student'  // This is important for discriminators
                    }
                },
                {
                    new: true,
                    runValidators: false
                }
            );
        }

        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        // Get current date for queries
        const now = new Date();

        // Default empty arrays for error handling
        let dashboardData = {
            upcomingLessons: [],
            activeAssignments: [],
            upcomingAssessments: [],
            recentGrades: [],
            attendanceRecords: [],
            courseMaterials: [],
            unreadMessages: 0,
            announcements: [],
            schedule: []
        };

        try {
            // Fetch all dashboard data in parallel using Promise.all
            const [
                upcomingLessons,
                activeAssignments,
                upcomingAssessments,
                recentGrades,
                attendanceRecords,
                courseMaterials,
                unreadMessages,
                announcements,
                weekSchedule
            ] = await Promise.all([
                Lesson.find({
                    students: student._id,
                    startTime: { $gte: now }
                })
                .populate('subject tutor')
                .sort('startTime')
                .limit(5)
                .lean()
                .catch(() => []),

                Assignment.find({
                    'submissions.student': { $ne: student._id },
                    dueDate: { $gte: now }
                })
                .populate('subject')
                .sort('dueDate')
                .lean()
                .catch(() => []),

                Assessment.find({
                    subject: { $in: student.subjects || [] },
                    dueDate: { $gte: now }
                })
                .populate('subject')
                .lean()
                .catch(() => []),

                Result.find({ student: student._id })
                .populate('subject')
                .sort('-issuedDate')
                .limit(5)
                .lean()
                .catch(() => []),

                Attendance.find({
                    'attendees.student': student._id
                })
                .populate({
                    path: 'lesson',
                    populate: {
                        path: 'subject tutor'
                    }
                })
                .sort('-date')
                .lean()
                .catch(() => []),

                CourseMaterial.find({
                    subject: { $in: student.subjects || [] },
                    gradeLevel: student.grade,
                    isActive: true
                })
                .populate('subject uploadedBy')
                .sort('-createdAt')
                .lean()
                .catch(() => []),

                Message.countDocuments({
                    recipient: student._id,
                    read: false
                }).catch(() => 0),

                Announcement.find({
                    $or: [
                        { recipientType: 'all' },
                        { recipientType: 'students' },
                        { recipientType: 'specific', recipients: student._id }
                    ],
                    expiryDate: { $gte: now }
                })
                .sort('-createdAt')
                .limit(5)
                .lean()
                .catch(() => []),

                Lesson.aggregate([
                    {
                        $match: {
                            students: student._id,
                            startTime: { 
                                $gte: now,
                                $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                            lessons: { $push: "$$ROOT" }
                        }
                    },
                    { $sort: { "_id": 1 } },
                    { $limit: 7 }
                ]).catch(() => [])
            ]);

            // Update dashboardData with fetched data
            dashboardData = {
                upcomingLessons,
                activeAssignments,
                upcomingAssessments,
                recentGrades,
                attendanceRecords,
                courseMaterials,
                unreadMessages,
                announcements,
                schedule: weekSchedule
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Continue with default empty values if there's an error
        }

        // Calculate overall grade
        const allResults = dashboardData.recentGrades || [];
        const overallGrade = allResults.length > 0 
            ? allResults.reduce((sum, result) => sum + result.score, 0) / allResults.length 
            : null;

        // Calculate attendance percentage
        const attendancePercentage = dashboardData.attendanceRecords.length > 0
            ? (dashboardData.attendanceRecords.filter(a => 
                a.attendees.find(att => 
                    att.student.toString() === student._id.toString() && 
                    att.status === 'Present'
                )
            ).length / dashboardData.attendanceRecords.length) * 100
            : 0;

        // Prepare and send response
        res.status(200).json({
            status: 'success',
            data: {
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    grade: student.grade,
                    subjects: student.subjects || [],
                    status: student.status,
                    feeStatus: student.feeStatus,
                    enrollmentDate: student.enrollmentDate,
                    lastActive: student.lastActive
                },
                dashboard: {
                    ...dashboardData,
                    overallGrade,
                    attendance: {
                        records: dashboardData.attendanceRecords,
                        percentage: attendancePercentage
                    }
                }
            }
        });

    } catch (err) {
        console.error('Student Dashboard Error:', err);
        next(new AppError('Error fetching student dashboard: ' + (err.message || 'Unknown error'), 500));
    }
};


exports.getTutorDashboard = async (req, res, next) => {
    try {
        const tutor = await Tutor.findById(req.user._id)
            .populate('subjects');

        if (!tutor) {
            return next(new AppError('Tutor not found', 404));
        }

        // Active classes
        const activeClasses = await Lesson.find({
            tutor: tutor._id,
            startTime: { $gte: new Date() }
        })
        .populate('subject students')
        .sort('startTime');

        //assessment management to tutor dashboard
        const tutorAssessments = await Assessment.find({
            creator: tutor._id
        }).populate('subject');

        const pendingAssessments = tutorAssessments.filter(
            assessment => assessment.dueDate >= new Date()
        );

        const completedAssessments = tutorAssessments.filter(
            assessment => assessment.dueDate < new Date()
        );


        // Pending assignments for review
        const pendingAssignments = await Assignment.find({
            tutor: tutor._id,
            'submissions': { $exists: true, $not: { $size: 0 } },
            'submissions.grade': { $exists: false }
        })
        .populate('subject')
        .sort('dueDate');

        // Recent student submissions
        const recentSubmissions = await Assignment.find({
            tutor: tutor._id,
            'submissions.submissionDate': { $exists: true }
        })
        .populate('subject submissions.student')
        .sort('-submissions.submissionDate')
        .limit(10);

        // Student performance statistics
        const studentPerformance = await Result.aggregate([
            {
                $match: { 
                    subject: { $in: tutor.subjects.map(s => s._id) }
                }
            },
            {
                $group: {
                    _id: '$subject',
                    averageScore: { $avg: '$score' },
                    highestScore: { $max: '$score' },
                    lowestScore: { $min: '$score' },
                    totalStudents: { $sum: 1 }
                }
            }
        ]);

        // Attendance statistics
        const attendanceStats = await Attendance.aggregate([
            {
                $match: {
                    lesson: { $in: activeClasses.map(c => c._id) }
                }
            },
            {
                $unwind: '$attendees'
            },
            {
                $group: {
                    _id: '$lesson',
                    totalPresent: {
                        $sum: { $cond: [{ $eq: ['$attendees.status', 'Present'] }, 1, 0] }
                    },
                    totalAbsent: {
                        $sum: { $cond: [{ $eq: ['$attendees.status', 'Absent'] }, 1, 0] }
                    },
                    totalLate: {
                        $sum: { $cond: [{ $eq: ['$attendees.status', 'Late'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Schedule for the week
        const schedule = await Lesson.aggregate([
            {
                $match: {
                    tutor: tutor._id,
                    startTime: {
                        $gte: new Date(),
                        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    lessons: { $push: "$$ROOT" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Unread messages
        const unreadMessages = await Message.countDocuments({
            recipient: tutor._id,
            read: false
        });

        // Recent announcements
        const announcements = await Announcement.find({
            $or: [
                { recipientType: 'all' },
                { recipientType: 'tutors' },
                { recipientType: 'specific', recipients: tutor._id }
            ],
            expiryDate: { $gte: new Date() }
        })
        .sort('-createdAt')
        .limit(5);

        res.status(200).json({
            status: 'success',
            data: {
                tutor: {
                    name: tutor.name,
                    subjects: tutor.subjects,
                    rating: tutor.rating
                },
                dashboard: {
                    activeClasses,
                    pendingAssignments,
                    assessments: {
                        pending: pendingAssessments,
                        completed: completedAssessments
                    },
                    recentSubmissions,
                    studentPerformance,
                    attendanceStats,
                    schedule,
                    unreadMessages,
                    announcements
                }
            }
        });
    } catch (err) {
        next(new AppError('Error fetching tutor dashboard', 500));
    }
};

exports.getAdminDashboard = async (req, res, next) => {
    try {
        console.log('Admin dashboard request received');
        console.log('User:', req.user);

        let admin = await Admin.findById(req.user._id);
        
        if (!admin && req.user.role === 'admin') {
            console.log('Creating new admin record...');
            admin = await Admin.create({
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: 'admin',
                department: 'Academic Affairs',
                adminLevel: 'Junior',
                permissions: ['manage_users', 'manage_courses'],
                status: 'active',
                isEmailVerified: true
            });
            console.log('Admin record created:', admin);
        }

        if (!admin) {
            return next(new AppError('Admin not found', 404));
        }

        try {
            // User statistics
            console.log('Fetching user statistics...');
            const userStats = {
                totalStudents: await User.countDocuments({ role: 'student' }),
                totalTutors: await User.countDocuments({ role: 'tutor' }),
                totalParents: await User.countDocuments({ role: 'parent' }),
                recentUsers: await User.find()
                    .sort('-createdAt')
                    .limit(10)
                    .select('name email role createdAt')
            };

            // Class statistics
            console.log('Fetching class statistics...');
            const classStats = {
                totalClasses: await Lesson.countDocuments(),
                activeClasses: await Lesson.countDocuments({
                    startTime: { $gte: new Date() }
                }),
                averageStudentsPerClass: await Lesson.aggregate([
                    {
                        $group: {
                            _id: null,
                            avgStudents: { $avg: { $size: "$students" } }
                        }
                    }
                ])
            };

            // Assessment statistics
            console.log('Fetching assessment statistics...');
            const assessmentStats = await Assessment.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAssessments: { $sum: 1 },
                        upcomingAssessments: {
                            $sum: {
                                $cond: [{ $gte: ['$dueDate', new Date()] }, 1, 0]
                            }
                        },
                        averageScore: { $avg: '$averageScore' }
                    }
                }
            ]);

            // Financial statistics
            console.log('Fetching financial statistics...');
            const financialStats = await User.aggregate([
                {
                    $match: { role: 'student' }
                },
                {
                    $group: {
                        _id: null,
                        totalFees: { $sum: '$totalFees' },
                        totalPaid: { $sum: '$paidFees' },
                        totalPending: { $sum: { $subtract: ['$totalFees', '$paidFees'] } }
                    }
                }
            ]);

            // Subject performance
            console.log('Fetching subject performance...');
            const subjectPerformance = await Result.aggregate([
                {
                    $group: {
                        _id: '$subject',
                        averageScore: { $avg: '$score' },
                        totalStudents: { $sum: 1 }
                    }
                }
            ]);

            // Attendance overview
            console.log('Fetching attendance overview...');
            const attendanceOverview = await Attendance.aggregate([
                {
                    $unwind: '$attendees'
                },
                {
                    $group: {
                        _id: '$attendees.status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Recent applications
            console.log('Fetching recent applications...');
            const recentApplications = {
                students: await StudentApplication.find()
                    .sort('-createdAt')
                    .limit(5),
                tutors: await TutorApplication.find()
                    .sort('-createdAt')
                    .limit(5)
            };

            // System notifications
            console.log('Fetching system notifications...');
            const systemNotifications = await Notification.find({
                type: 'system',
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }).sort('-createdAt');

            const dashboardData = {
                admin: {
                    name: admin.name,
                    department: admin.department,
                    adminLevel: admin.adminLevel
                },
                userStats,
                // assessmentStats: assessmentStats[0],
                assessmentStats,
                classStats,
                // financialStats: financialStats[0],
                financialStats,
                subjectPerformance,
                attendanceOverview,
                recentApplications,
                systemNotifications
            };

            console.log('Successfully compiled dashboard data');
            return res.status(200).json({
                status: 'success',
                data: dashboardData
            });

        } catch (statsError) {
            console.error('Error fetching statistics:', statsError);
            throw statsError;
        }

    } catch (err) {
        console.error('Dashboard error:', err);
        next(new AppError('Error fetching admin dashboard', 500));
    }
};

exports.getParentDashboard = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.user._id)
            .populate('children');

        if (!parent) {
            return next(new AppError('Parent not found', 404));
        }

        // Get detailed information for each child
        const childrenDetails = await Promise.all(parent.children.map(async (child) => {
            // Academic performance
            const results = await Result.find({ student: child._id })
                .populate('subject')
                .sort('-issuedDate');

            const overallGrade = results.length > 0
                ? results.reduce((sum, result) => sum + result.score, 0) / results.length
                : null;

            // Attendance record
            const attendance = await Attendance.find({
                'attendees.student': child._id
            })
            .populate('lesson')
            .sort('-date');

            // Calculate attendance percentage
            const attendancePercentage = attendance.length > 0
                ? (attendance.filter(a => 
                    a.attendees.find(att => 
                        att.student.toString() === child._id.toString() && 
                        att.status === 'Present'
                    )
                ).length / attendance.length) * 100
                : 0;

            // Upcoming assignments
            const upcomingAssignments = await Assignment.find({
                'submissions.student': { $ne: child._id },
                dueDate: { $gte: new Date() }
            })
            .populate('subject')
            .sort('dueDate');

            // Schedule
            const schedule = await Lesson.find({
                students: child._id,
                startTime: { $gte: new Date() }
            })
            .populate('subject tutor')
            .sort('startTime');

            // Recent announcements
            const announcements = await Announcement.find({
                $or: [
                    { recipientType: 'all' },
                    { recipientType: 'students' },
                    { recipientType: 'specific', recipients: child._id }
                ],
                expiryDate: { $gte: new Date() }
            })
            .sort('-createdAt')
            .limit(5);

            return {
                childId: child._id,
                name: child.name,
                grade: child.grade,
                academicPerformance: {
                    results,
                    overallGrade,
                    recentResults: results.slice(0, 5)
                },
                attendance: {
                    records: attendance.slice(0, 10),
                    percentage: attendancePercentage
                },
                upcomingAssignments,
                schedule: schedule.slice(0, 7),
                announcements
            };
        }));

        // Financial information
        const financialInfo = {
            totalFees: parent.children.reduce((sum, child) => sum + child.totalFees, 0),
            paidFees: parent.children.reduce((sum, child) => sum + child.paidFees, 0),
            pendingFees: parent.children.reduce((sum, child) => sum + (child.totalFees - child.paidFees), 0),
            paymentHistory: await FeePayment.find({
                student: { $in: parent.children.map(child => child._id) }
            }).sort('-paymentDate')
        };

        // Unread messages
        const unreadMessages = await Message.countDocuments({
            recipient: parent._id,
            read: false
        });

        // Parent-specific announcements
        const parentAnnouncements = await Announcement.find({
            $or: [
                { recipientType: 'all' },
                { recipientType: 'parents' },
                { recipientType: 'specific', recipients: parent._id }
            ],
            expiryDate: { $gte: new Date() }
        })
        .sort('-createdAt')
        .limit(5);

        res.status(200).json({
            status: 'success',
            data: {
                parent: {
                    name: parent.name,
                    email: parent.email
                },
                childrenDetails,
                financialInfo,
                unreadMessages,
                parentAnnouncements
            }
        });
    } catch (err) {
        next(new AppError('Error fetching parent dashboard', 500));
    }
};

// Additional helper functions for dashboard operations
exports.calculateStudentPerformance = async (studentId) => {
    const assessments = await Assessment.find({
        'submissions.student': studentId
    });
    
    return assessments.map(assessment => ({
        subject: assessment.subject,
        score: assessment.submissions.find(
            sub => sub.student.toString() === studentId.toString()
        ).score,
        maxScore: assessment.maxScore,
        date: assessment.dueDate
    }));
};

exports.getAssessmentStatistics = async (assessmentId) => {
    const assessment = await Assessment.findById(assessmentId)
        .populate('submissions.student');
    
    if (!assessment) return null;

    const submissions = assessment.submissions;
    const totalSubmissions = submissions.length;
    const averageScore = submissions.reduce((acc, sub) => acc + sub.score, 0) / totalSubmissions;
    
    return {
        totalSubmissions,
        averageScore,
        highestScore: Math.max(...submissions.map(sub => sub.score)),
        lowestScore: Math.min(...submissions.map(sub => sub.score))
    };
};

