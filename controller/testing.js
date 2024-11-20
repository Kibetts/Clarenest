exports.getStudentDashboard = async (req, res, next) => {
    try {
        const studentId = req.user._id;
        
        // Fetch student's basic info with populated subjects
        const student = await Student.findById(studentId)
            .populate('subjects')
            .select('name email grade subjects');

        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        // Get current date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch lessons where student is enrolled
        const lessons = await Lesson.find({
            students: studentId
        }).populate('subject tutor');

        // Process lessons into schedule and upcoming lessons
        const todaySchedule = [];
        const upcomingLessons = [];
        
        lessons.forEach(lesson => {
            lesson.schedule.forEach(slot => {
                const startTime = new Date(slot.startTime);
                const endTime = new Date(slot.endTime);

                if (startTime.toDateString() === today.toDateString()) {
                    todaySchedule.push({
                        id: lesson._id,
                        subject: {
                            id: lesson.subject._id,
                            title: lesson.subject.title
                        },
                        tutor: {
                            id: lesson.tutor._id,
                            name: lesson.tutor.name
                        },
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString()
                    });
                }
                
                if (startTime > today) {
                    upcomingLessons.push({
                        id: lesson._id,
                        subject: {
                            id: lesson.subject._id,
                            title: lesson.subject.title
                        },
                        tutor: {
                            id: lesson.tutor._id,
                            name: lesson.tutor.name
                        },
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                        duration: Math.round((endTime - startTime) / (1000 * 60))
                    });
                }
            });
        });

        // Sort schedules
        todaySchedule.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        upcomingLessons.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        //  attendance 
        const attendanceRecords = await Attendance.find({
            'attendees.student': student._id
        });

        const attendancePercentage = attendanceRecords.length > 0
            ? (attendanceRecords.filter(a => 
                a.attendees.find(att => 
                    att.student.toString() === student._id.toString() && 
                    att.status === 'Present'
                )
            ).length / attendanceRecords.length) * 100
            : 0;

        const recentGrades = await Result.find({ student: student._id })
            .populate('subject')
            .sort('-createdAt')
            .limit(5);

        const overallGrade = recentGrades.length > 0
            ? recentGrades.reduce((sum, grade) => sum + grade.score, 0) / recentGrades.length
            : null;

        // Format response data
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
                    upcomingLessons: upcomingLessons.slice(0, 5),
                    attendance: {
                        records: attendanceRecords,
                        percentage: attendancePercentage
                    },
                    recentGrades,
                    overallGrade,
                    schedule: [{
                        date: today.toISOString(),
                        lessons: todaySchedule
                    }]
                }
            }
        });

    } catch (err) {
        console.error('Dashboard error:', err);
        next(new AppError('Error fetching student dashboard', 500));
    }
};




// TO REMVE
exports.getStudentDashboard = async (req, res, next) => {
    try {
        let student = await Student.findById(req.user._id)
            .populate('subjects');
        
        if (!student) {
            return next(new AppError('Student not found', 404));
        }

        const now = new Date();
        const today = new Date();
        const currentDay = today.toLocaleString('en-US', { weekday: 'long' });
        
        // Fetch all lessons for this student
        const studentLessons = await Lesson.find({
            students: student._id
        })
        .populate('subject tutor')
        .lean();

        // Process today's schedule
        const todaySchedule = studentLessons.filter(lesson => {
            return lesson.schedule.some(schedule => schedule.day === currentDay);
        }).map(lesson => {
            const todayScheduleItem = lesson.schedule.find(s => s.day === currentDay);
            return {
                _id: lesson._id,
                subject: {
                    title: lesson.subject?.name || 'N/A'
                },
                tutor: {
                    name: lesson.tutor?.name || 'N/A'
                },
                startTime: todayScheduleItem.startTime,
                endTime: todayScheduleItem.endTime
            };
        }).sort((a, b) => {
            // Sort by start time
            const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
            const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
            return timeA - timeB;
        });

        // Process upcoming lessons (next 5 occurrences)
        const upcomingLessons = [];
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayIndex = daysOfWeek.indexOf(currentDay);
        
        studentLessons.forEach(lesson => {
            lesson.schedule.forEach(schedule => {
                const scheduleDayIndex = daysOfWeek.indexOf(schedule.day);
                let daysUntilLesson = scheduleDayIndex - currentDayIndex;
                if (daysUntilLesson <= 0) {
                    daysUntilLesson += 7; // Push to next week if day has passed
                }

                const lessonDate = new Date(today);
                lessonDate.setDate(today.getDate() + daysUntilLesson);
                
                upcomingLessons.push({
                    _id: lesson._id,
                    subject: {
                        title: lesson.subject?.name || 'N/A'
                    },
                    tutor: {
                        name: lesson.tutor?.name || 'N/A'
                    },
                    startTime: `${lessonDate.toISOString().split('T')[0]}T${schedule.startTime}`,
                    endTime: `${lessonDate.toISOString().split('T')[0]}T${schedule.endTime}`,
                    duration: calculateDuration(schedule.startTime, schedule.endTime)
                });
            });
        });

        // Sort upcoming lessons by date/time and limit to 5
        const sortedUpcomingLessons = upcomingLessons
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5);

        // Rest of your existing code for attendance and grades...
        const attendanceRecords = await Attendance.find({
            'attendees.student': student._id
        });

        const attendancePercentage = attendanceRecords.length > 0
            ? (attendanceRecords.filter(a => 
                a.attendees.find(att => 
                    att.student.toString() === student._id.toString() && 
                    att.status === 'Present'
                )
            ).length / attendanceRecords.length) * 100
            : 0;

        const recentGrades = await Result.find({ student: student._id })
            .populate('subject')
            .sort('-createdAt')
            .limit(5);

        const overallGrade = recentGrades.length > 0
            ? recentGrades.reduce((sum, grade) => sum + grade.score, 0) / recentGrades.length
            : null;

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
                    upcomingLessons: sortedUpcomingLessons,
                    attendance: {
                        records: attendanceRecords,
                        percentage: attendancePercentage
                    },
                    recentGrades,
                    overallGrade,
                    schedule: [{
                        date: today.toISOString(),
                        lessons: todaySchedule
                    }]
                }
            }
        });

    } catch (err) {
        console.error('Dashboard error:', err);
        next(new AppError('Error fetching student dashboard', 500));
    }
};
