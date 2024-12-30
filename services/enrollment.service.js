const Subject = require('../models/subject.model');
const Enrollment = require('../models/enrollment.model');
const Student = require('../models/student.model');

const GRADE_SUBJECTS = {
    'K1': ['Mathematics', 'English Language', 'Creative Arts', 'Physical Education', 
           'Music and Movement', 'Social Studies', 'Science Exploration'],
    'K2': ['Mathematics', 'English Language', 'Creative Arts', 'Physical Education', 
           'Music and Movement', 'Social Studies', 'Science Exploration'],
    'Grade 1': ['Mathematics', 'English Language', 'Science', 'Social Studies', 
                'Physical Education', 'Creative Arts', 'Music', 'Reading and Writing Skills'],
    // ... Add all grade levels and their subjects
    'Grade 9': ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 
                'History', 'Geography', 'Physical Education', 'Computer Studies/ICT',
                'Civic Education', 'Foreign Language'],
    // ... Continue for other grades
};

const enrollStudentInGradeSubjects = async (studentId, gradeLevel) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        const subjects = GRADE_SUBJECTS[gradeLevel];
        if (!subjects) {
            throw new Error('Invalid grade level');
        }

        // Get current academic year
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        // Find all subjects for the grade level
        const subjectDocs = await Subject.find({
            title: { $in: subjects },
            gradeLevel: gradeLevel
        });

        // Create enrollments for each subject
        const enrollmentPromises = subjectDocs.map(subject => 
            Enrollment.create({
                student: studentId,
                subject: subject._id,
                gradeLevel,
                academicYear,
                status: 'active'
            })
        );

        await Promise.all(enrollmentPromises);

        // Update student's subjects array
        student.subjects = subjectDocs.map(subject => subject._id);
        await student.save();

        return true;
    } catch (error) {
        console.error('Error in enrollStudentInGradeSubjects:', error);
        throw error;
    }
};

module.exports = {
    enrollStudentInGradeSubjects,
    GRADE_SUBJECTS
};

