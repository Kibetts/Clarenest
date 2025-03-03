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
const CourseMaterial = require('../models/courseMaterial.model').default || require('../models/courseMaterial.model');const Announcement = require('../models/announcement.model');
const StudentApplication = require('../models/studentApplication.model');
const TutorApplication = require('../models/tutorApplication.model');
const User = require('../models/user.model');
const FeePayment = require('../models/feePayment.model');
const Notification = require('../models/notification.model');
const AppError = require('../utils/appError');
const Enrollment = require('../models/enrollment.model');
const { enrollStudentInGradeSubjects } = require('../services/enrollment.service');

exports.getStudentDashboard = async (req, res, next) => {
    try {
        const studentId = req.user._id;
        const now = new Date();
        const startOfDay = new Date(now.setHours(0,0,0,0));
        const endOfDay = new Date(now.setHours(23,59,59,999));

        // Get current academic year
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        // Get student with populated subjects
        const student = await Student.findById(studentId)
            .populate({
                path: 'subjects',
                populate: {
                    path: 'tutor',
                    select: 'name email'
                }
            });

        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        const studentGrade = student.grade;

        // Check if student needs to be enrolled in subjects
        if (!student.subjects || student.subjects.length === 0) {
            console.log('No subjects found for student. Attempting to enroll...');
            try {
                await enrollStudentInGradeSubjects(studentId, studentGrade);
                // Reload student with newly enrolled subjects
                student = await Student.findById(studentId).populate({
                    path: 'subjects',
                    populate: {
                        path: 'tutor',
                        select: 'name email'
                    }
                });
            } catch (enrollError) {
                console.error('Error enrolling student in subjects:', enrollError);
            }
        }

        // Get today's lessons matching the student's grade
        const todayLessons = await Lesson.find({
            gradeLevel: studentGrade,
            'schedule.startTime': {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).populate('subject tutor');

        // Get upcoming lessons
        const upcomingLessons = await Lesson.find({
            gradeLevel: studentGrade,
            'schedule.startTime': { $gt: now }
        })
        .populate('subject tutor')
        .sort('schedule.startTime')
        .limit(5);

        // Get active enrollments with subjects for the current academic year
        const enrollments = await Enrollment.find({
            student: studentId,
            status: 'active',
            academicYear: academicYear
        })
        .populate({
            path: 'subject',
            populate: {
                path: 'tutor',
                select: 'name email'
            }
        });

        // If no enrollments found but student has subjects, create enrollments
        if (enrollments.length === 0 && student.subjects.length > 0) {
            const enrollmentPromises = student.subjects.map(subject => 
                Enrollment.create({
                    student: studentId,
                    subject: subject._id,
                    gradeLevel: studentGrade,
                    academicYear,
                    status: 'active'
                })
            );
            await Promise.all(enrollmentPromises);
        }

        // Calculate attendance
        const attendanceRecords = await Attendance.find({
            'attendees.student': studentId
        })
        .populate({
            path: 'lesson',
            populate: { path: 'subject tutor' }
        })
        .sort('-date');

        const totalClasses = attendanceRecords.length;
        const presentClasses = attendanceRecords.filter(record => 
            record.attendees.find(att => 
                att.student.toString() === studentId.toString() && 
                att.status === 'Present'
            )
        ).length;

        const attendancePercentage = totalClasses ? (presentClasses / totalClasses) * 100 : 0;

        // Ensure we're sending the most up-to-date enrollments
        const finalEnrollments = await Enrollment.find({
            student: studentId,
            status: 'active',
            academicYear: academicYear
        }).populate({
            path: 'subject',
            populate: {
                path: 'tutor',
                select: 'name email'
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    grade: student.grade
                },
                dashboard: {
                    schedule: [{
                        date: startOfDay.toISOString(),
                        lessons: todayLessons
                    }],
                    upcomingLessons,
                    attendance: {
                        records: attendanceRecords,
                        percentage: attendancePercentage
                    },
                    activeAssignments: [],
                    upcomingAssessments: [],
                    enrollments: finalEnrollments
                }
            }
        });

    } catch (err) {
        console.error('Dashboard error:', err);
        next(new AppError('Error fetching student dashboard', 500));
    }
};

exports.getTutorDashboard = async (req, res, next) => {
    try {
        console.log('Received tutor dashboard request for user:', req.user);
        
        const tutor = await Tutor.findById(req.user._id)
            .populate('subjects');

        if (!tutor) {
            return next(new AppError('Tutor not found', 404));
        }

        try {
            // Active classes
            const activeClasses = await Lesson.find({
                tutor: tutor._id,
                startTime: { $gte: new Date() }
            })
            .populate('subject students')
            .sort('startTime')
            .lean()
            .catch(() => []);

            //assessment management
            const tutorAssessments = await Assessment.find({
                creator: tutor._id
            })
            .populate('subject')
            .lean()
            .catch(() => []);

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
            .sort('dueDate')
            .lean()
            .catch(() => []);

            // Recent student submissions
            const recentSubmissions = await Assignment.find({
                tutor: tutor._id,
                'submissions.submissionDate': { $exists: true }
            })
            .populate('subject submissions.student')
            .sort('-submissions.submissionDate')
            .limit(10)
            .lean()
            .catch(() => []);

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
            ]).catch(() => []);

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
            ]).catch(() => []);

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
            ]).catch(() => []);

            // Unread messages
            const unreadMessages = await Message.countDocuments({
                recipient: tutor._id,
                read: false
            }).catch(() => 0);

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
            .limit(5)
            .lean()
            .catch(() => []);

            res.status(200).json({
                status: 'success',
                data: {
                    tutor: {
                        id: tutor._id,
                        name: tutor.name,
                        email: tutor.email,
                        subjects: tutor.subjects,
                        qualifications: tutor.qualifications,
                        yearsOfExperience: tutor.yearsOfExperience,
                        preferredGradeLevels: tutor.preferredGradeLevels,
                        status: tutor.status
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

        } catch (error) {
            console.error('Error fetching tutor dashboard data:', error);
            // Continue with empty values if there's an error
            res.status(200).json({
                status: 'success',
                data: {
                    tutor: {
                        id: tutor._id,
                        name: tutor.name,
                        email: tutor.email,
                        subjects: tutor.subjects,
                        qualifications: tutor.qualifications,
                        yearsOfExperience: tutor.yearsOfExperience,
                        preferredGradeLevels: tutor.preferredGradeLevels,
                        status: tutor.status
                    },
                    dashboard: {
                        activeClasses: [],
                        pendingAssignments: [],
                        assessments: {
                            pending: [],
                            completed: []
                        },
                        recentSubmissions: [],
                        studentPerformance: [],
                        attendanceStats: [],
                        schedule: [],
                        unreadMessages: 0,
                        announcements: []
                    }
                }
            });
        }

    } catch (err) {
        console.error('Tutor Dashboard Error:', err);
        next(new AppError('Error fetching tutor dashboard: ' + (err.message || 'Unknown error'), 500));
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
            const financialStats = await FeePayment.aggregate([
                {
                    $facet: {
                        'totalStats': [
                            {
                                $group: {
                                    _id: null,
                                    totalPaid: { $sum: '$amount' },
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        'monthlyStats': [
                            {
                                $match: {
                                    paymentDate: {
                                        $gte: new Date(new Date().setDate(1)) // First day of current month
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    monthlyRevenue: { $sum: '$amount' }
                                }
                            }
                        ]
                    }
                }
            ]);
    
            // Calculate total fees from all students
            const totalFeesData = await Student.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFees: { $sum: '$totalFees' }
                    }
                }
            ]);
    
            const totalFees = totalFeesData[0]?.totalFees || 0;
            const totalPaid = financialStats[0]?.totalStats[0]?.totalPaid || 0;
            const monthlyRevenue = financialStats[0]?.monthlyStats[0]?.monthlyRevenue || 0;
    

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
                financialStats: {
                    totalFees,
                    totalPaid,
                    totalPending: totalFees - totalPaid,
                    revenueThisMonth: monthlyRevenue,
                    outstandingPayments: totalFees - totalPaid
                },
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
        // Find parent and populate children
        const parent = await Parent.findById(req.user._id)
            .populate('children');

        if (!parent) {
            return next(new AppError('Parent not found', 404));
        }

        try {
            // Get detailed information for each child
            const childrenDetails = await Promise.all(parent.children.map(async (child) => {
                try {
                    // Academic performance
                    const results = await Result.find({ student: child._id })
                        .populate('subject')
                        .sort('-issuedDate');

                    const overallGrade = results.length > 0
                        ? results.reduce((sum, result) => sum + result.score, 0) / results.length
                        : null;

                    // Attendance record with lesson details
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

                    // Upcoming assignments with subject details
                    const upcomingAssignments = await Assignment.find({
                        'submissions.student': { $ne: child._id },
                        dueDate: { $gte: new Date() }
                    })
                    .populate('subject')
                    .sort('dueDate');

                    // Schedule with subject and tutor details
                    const schedule = await Lesson.find({
                        students: child._id,
                        startTime: { $gte: new Date() }
                    })
                    .populate('subject tutor')
                    .sort('startTime');

                    // Student-specific announcements
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
                } catch (error) {
                    console.error(`Error processing child ${child._id} details:`, error);
                    return {
                        childId: child._id,
                        name: child.name,
                        grade: child.grade,
                        error: 'Error loading child details'
                    };
                }
            }));

            // Calculate comprehensive financial information
            const financialInfo = {
                totalFees: parent.children.reduce((sum, child) => sum + (child.totalFees || 0), 0),
                paidFees: parent.children.reduce((sum, child) => sum + (child.paidFees || 0), 0),
                pendingFees: parent.children.reduce((sum, child) => 
                    sum + ((child.totalFees || 0) - (child.paidFees || 0)), 0),
                paymentHistory: await FeePayment.find({
                    student: { $in: parent.children.map(child => child._id) }
                }).sort('-paymentDate')
            };

            // Get count of unread messages
            const unreadMessages = await Message.countDocuments({
                recipient: parent._id,
                read: false
            });

            // Get parent-specific announcements
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

            // Get and format distributed assessments
            const distributedAssessments = await Assessment.find({
                'distributedTo.parent': parent._id
            }).populate('subject creator');

            // Filter pending assessments
            const pendingAssessments = distributedAssessments.filter(assessment => {
                const distribution = assessment.distributedTo.find(dist => 
                    dist.parent.equals(parent._id)
                );
                return !distribution.downloaded;
            });

            // Send comprehensive dashboard response
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
                    parentAnnouncements,
                    pendingAssessments: pendingAssessments.map(assessment => ({
                        id: assessment._id,
                        title: assessment.title,
                        subject: assessment.subject.name,
                        distributedAt: assessment.distributedTo.find(dist => 
                            dist.parent.equals(parent._id)
                        ).distributedAt,
                        tutor: assessment.creator.name
                    }))
                }
            });

        } catch (innerError) {
            console.error('Error processing dashboard data:', innerError);
            next(new AppError('Error processing dashboard data: ' + innerError.message, 500));
        }

    } catch (err) {
        console.error('Parent Dashboard Error:', err);
        next(new AppError('Error fetching parent dashboard: ' + err.message, 500));
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

exports.getStudentCourses = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id)
            .populate('subjects')
            .populate({
                path: 'enrollments',
                populate: {
                    path: 'subject',
                    populate: { path: 'tutor', select: 'name email' }
                }
            });

        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                courses: student.subjects,
                enrollments: student.enrollments
            }
        });
    } catch (err) {
        next(new AppError('Error fetching student courses', 500));
    }
};

exports.getCourseMaterials = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id)
            .populate('subjects');
            
        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        const materials = await CourseMaterial.find({
            $or: [
                { subject: { $in: student.subjects.map(s => s._id) } },
                { gradeLevel: student.grade }
            ],
            isActive: true
        })
        .populate('subject')
        .populate('uploadedBy', 'name')
        .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: { materials }
        });
    } catch (err) {
        console.error('Course materials error:', err);
        next(new AppError('Error fetching course materials', 500));
    }
};

exports.getStudentAssignments = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        const assignments = await Assignment.find({
            'submissions.student': { $ne: student._id },
            dueDate: { $gte: new Date() }
        })
        .populate('subject tutor')
        .sort('dueDate');

        res.status(200).json({
            status: 'success',
            data: { assignments }
        });
    } catch (err) {
        next(new AppError('Error fetching assignments', 500));
    }
};

exports.getStudentAssessments = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        const assessments = await Assessment.find({
            subject: { $in: student.subjects },
            dueDate: { $gte: new Date() }
        })
        .populate('subject')
        .sort('dueDate');

        res.status(200).json({
            status: 'success',
            data: { assessments }
        });
    } catch (err) {
        next(new AppError('Error fetching assessments', 500));
    }
};

exports.getStudentGrades = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        const [assessments, results] = await Promise.all([
            Assessment.find({
                subject: { $in: student.subjects },
                dueDate: { $gt: new Date() }
            }).populate('subject'),
            
            Result.find({ student: student._id })
                .populate('subject')
                .sort('-issuedDate')
        ]);

        // Calculate overall grade
        const overallGrade = results.length > 0
            ? results.reduce((sum, result) => sum + result.score, 0) / results.length
            : null;

        res.status(200).json({
            status: 'success',
            data: {
                assessments,
                results,
                overallGrade
            }
        });
    } catch (err) {
        next(new AppError('Error fetching grades', 500));
    }
};

exports.getStudentAttendance = async (req, res, next) => {
    try {
        const studentId = req.user._id;
        
        const attendanceRecords = await Attendance.find({
            'attendees.student': studentId
        })
        .populate({
            path: 'lesson',
            populate: { 
                path: 'subject tutor',
                select: 'name title'
            }
        })
        .sort('-date');

        if (!attendanceRecords) {
            return res.status(200).json({
                status: 'success',
                data: {
                    records: [],
                    statistics: {
                        totalClasses: 0,
                        presentClasses: 0,
                        percentage: 0
                    }
                }
            });
        }

        const totalClasses = attendanceRecords.length;
        const presentClasses = attendanceRecords.filter(record => 
            record.attendees.find(att => 
                att.student.toString() === studentId.toString() && 
                att.status === 'Present'
            )
        ).length;

        const attendancePercentage = totalClasses ? (presentClasses / totalClasses) * 100 : 0;

        res.status(200).json({
            status: 'success',
            data: {
                records: attendanceRecords,
                statistics: {
                    totalClasses,
                    presentClasses,
                    percentage: attendancePercentage
                }
            }
        });
    } catch (err) {
        console.error('Attendance error:', err);
        next(new AppError('Error fetching attendance', 500));
    }
};

exports.getStudentMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({
            $or: [
                { recipient: req.user._id },
                { sender: req.user._id }
            ]
        })
        .populate('sender recipient', 'name role')
        .sort('-createdAt');

        const unreadCount = await Message.countDocuments({
            recipient: req.user._id,
            read: false
        });

        res.status(200).json({
            status: 'success',
            data: {
                messages,
                unreadCount
            }
        });
    } catch (err) {
        next(new AppError('Error fetching messages', 500));
    }
};