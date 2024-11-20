
const Lesson = require('../models/lesson.model');
const User = require('../models/user.model');
const Tutor = require('../models/tutor.model')
const { ROLES } = require('../config/roles');

// exports.getAllLessons = async (req, res) => {
//     try {
//         const lessons = await Lesson.find().populate('subject tutor students');
//         res.status(200).json({
//             status: 'success',
//             results: lessons.length,
//             data: {
//                 lessons
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'error',
//             message: err.message
//         });
//     }
// };
exports.getAllLessons = async (req, res) => {
    try {
        let query = Lesson.find()
            .populate('tutor', 'name email')
            .populate('students', 'name email status')
            .populate('subject');
        
        const lessons = await query;
        
        res.status(200).json({
            status: 'success',
            results: lessons.length,
            data: { lessons }
        });
    } catch (err) {
        console.error('Error fetching lessons:', err);
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('subject tutor students');
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.status(200).json({
            status: 'success',
            data: {
                lesson: lesson
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

// exports.createLesson = async (req, res) => {
//     try {
//         if (req.user.role !== ROLES.ADMIN) {
//             return res.status(403).json({ message: 'Only admins can create lessons' });
//         }

//         // Add current date info to schedule entries
//         const scheduleWithDates = req.body.schedule.map(slot => {
//             const today = new Date();
//             const [hours, minutes] = slot.startTime.split(':');
//             const [endHours, endMinutes] = slot.endTime.split(':');
            
//             // Find next occurrence of the given day
//             const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//             const targetDay = daysOfWeek.indexOf(slot.day);
//             const currentDay = today.getDay();
//             const daysUntilTarget = (targetDay + 7 - currentDay) % 7;
            
//             const startDate = new Date(today);
//             startDate.setDate(today.getDate() + daysUntilTarget);
//             startDate.setHours(hours, minutes, 0, 0);

//             const endDate = new Date(startDate);
//             endDate.setHours(endHours, endMinutes, 0, 0);

//             return {
//                 ...slot,
//                 startTime: startDate,
//                 endTime: endDate
//             };
//         });

//         const newLesson = new Lesson({
//             ...req.body,
//             schedule: scheduleWithDates,
//             currentEnrollment: 0
//         });

//         // Find all students in the specified grade level
//         const students = await User.find({ 
//             role: 'student',
//             grade: req.body.gradeLevel,
//             status: 'active'
//         });

//         // Enroll students up to capacity
//         const studentsToEnroll = students.slice(0, req.body.capacity);
//         newLesson.students = studentsToEnroll.map(student => student._id);
//         newLesson.currentEnrollment = studentsToEnroll.length;

//         await newLesson.save();

//         // Update students' enrolled classes
//         for (const student of studentsToEnroll) {
//             await User.findByIdAndUpdate(student._id, {
//                 $addToSet: { subjects: req.body.subject }
//             });
//         }

//         // Update tutor's assigned classes
//         await User.findByIdAndUpdate(req.body.tutor, {
//             $addToSet: { assignedClasses: newLesson._id }
//         });

//         res.status(201).json({
//             status: 'success',
//             data: {
//                 lesson: newLesson
//             }
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

exports.createLesson = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can create lessons' });
        }

        // Add current date info to schedule entries
        const scheduleWithDates = req.body.schedule.map(slot => {
            const today = new Date();
            const [hours, minutes] = slot.startTime.split(':');
            const [endHours, endMinutes] = slot.endTime.split(':');
            
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const targetDay = daysOfWeek.indexOf(slot.day);
            const currentDay = today.getDay();
            const daysUntilTarget = (targetDay + 7 - currentDay) % 7;
            
            const startDate = new Date(today);
            startDate.setDate(today.getDate() + daysUntilTarget);
            startDate.setHours(hours, minutes, 0, 0);

            const endDate = new Date(startDate);
            endDate.setHours(endHours, endMinutes, 0, 0);

            return {
                ...slot,
                startTime: startDate,
                endTime: endDate
            };
        });

        // Create new lesson
        const newLesson = new Lesson({
            ...req.body,
            schedule: scheduleWithDates,
            currentEnrollment: 0
        });

        // Find all eligible students
        const students = await User.find({ 
            role: 'student',
            grade: req.body.gradeLevel,
            status: 'active'
        });

        // Enroll students
        const studentsToEnroll = students.slice(0, req.body.capacity);
        newLesson.students = studentsToEnroll.map(student => student._id);
        newLesson.currentEnrollment = studentsToEnroll.length;

        await newLesson.save();

        // Update tutor's assigned classes
        await Tutor.findByIdAndUpdate(req.body.tutor, {
            $addToSet: { assignedClasses: newLesson._id }
        });

        // Update students' enrolled subjects
        await User.updateMany(
            { _id: { $in: studentsToEnroll.map(s => s._id) } },
            { $addToSet: { subjects: req.body.subject } }
        );

        // Populate the response
        const populatedLesson = await Lesson.findById(newLesson._id)
            .populate('subject')
            .populate('tutor')
            .populate('students');

        res.status(201).json({
            status: 'success',
            data: {
                lesson: populatedLesson
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateLesson = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can update lessons' });
        }

        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                lesson: lesson
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only admins can delete lessons' });
        }

        const lesson = await Lesson.findByIdAndDelete(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Remove lesson reference from tutor
        await User.findByIdAndUpdate(
            lesson.tutor,
            { $pull: { assignedClasses: lesson._id } }
        );

        // Remove lesson reference from students
        if (lesson.students && lesson.students.length > 0) {
            await User.updateMany(
                { _id: { $in: lesson.students } },
                { $pull: { subjects: lesson.subject } }
            );
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.enrollStudent = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const student = await User.findById(req.body.studentId);
        if (!student || student.role !== ROLES.STUDENT) {
            return res.status(400).json({ message: 'Invalid student' });
        }

        if (lesson.students.includes(student._id)) {
            return res.status(400).json({ message: 'Student already enrolled in this lesson' });
        }

        if (lesson.currentEnrollment >= lesson.capacity) {
            return res.status(400).json({ message: 'Lesson is at full capacity' });
        }

        lesson.students.push(student._id);
        lesson.currentEnrollment += 1;
        await lesson.save();

        res.status(200).json({
            status: 'success',
            message: 'Student enrolled successfully',
            data: {
                lesson: lesson
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getLessonStudents = async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.lessonId)
        .populate('students', 'name email');
        
      if (!lesson) {
        return res.status(404).json({
          status: 'fail',
          message: 'Lesson not found'
        });
      }
  
      res.status(200).json({
        status: 'success',
        data: { students: lesson.students }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  };