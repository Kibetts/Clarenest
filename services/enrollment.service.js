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
    
    'Grade 2': ['Mathematics', 'English Language', 'Science', 'Social Studies', 
                'Physical Education', 'Creative Arts', 'Music', 'Reading and Writing Skills'],

    'Grade 3': ['Mathematics', 'English Language', 'Science', 'Social Studies', 
                'Physical Education', 'Creative Arts', 'Music', 'Reading and Writing Skills', 'Environmental Studies'],

    'Grade 4': ['Mathematics', 'English Language', 'Science', 'Social Studies', 
                'Physical Education', 'Creative Arts', 'Music', 'Environmental Studies', 'Information and Communication Technology (ICT)'],

    'Grade 5': ['Mathematics', 'English Language', 'Science', 'Social Studies', 
                'Physical Education', 'Creative Arts', 'Music', 'Information and Communication Technology (ICT)'],

    'Grade 6': ['Mathematics', 'English Language', 'Science', 'Social Studies', 
                'Physical Education', 'Creative Arts', 'Music', 'Environmental Studies', 'Information and Communication Technology (ICT)', 'Civic Education'],

    'Grade 7': ['Mathematics', 'English Language', 'Science', 'Social Studies', 
                'Physical Education', 'Creative Arts', 'Music','History and Geography', 'Information and Communication Technology (ICT)', 'Civic Education'],

    'Grade 8': ['Mathematics', 'English Language', 'Science', 'Social Studies', 
                'Physical Education', 'Creative Arts', 'Music', 'History and Geography', 'Information and Communication Technology (ICT)', 'Civic Education'],
    
    'Grade 9': ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 
                'History', 'Geography', 'Physical Education', 'Computer Studies/ICT',
                'Civic Education', 'Foreign Language'],

    'Grade 10': ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 
                'History', 'Geography', 'Physical Education', 'Computer Studies/ICT',
                'Civic Education', 'Foreign Language'],

    'Grade 11': ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 
                'History', 'Geography', 'Physical Education', 'Computer Studies/ICT',
                'Civic Education', 'Foreign Language', 'Elective Subjects (e.g., Business Studies, Fine Arts, etc.)'],

    'Grade 12': ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 
                'History', 'Geography', 'Physical Education', 'Computer Studies/ICT',
                'Civic Education', 'Foreign Language', 'Elective Subjects (e.g., Business Studies, Fine Arts, etc.)']
    
};

// const enrollStudentInGradeSubjects = async (studentId, gradeLevel) => {
//     try {
//         const student = await Student.findById(studentId);
//         if (!student) {
//             throw new Error('Student not found');
//         }

//         // Format grade level to "Grade X" format
//         const formatGradeLevel = (grade) => {
//             // Remove any existing "Grade " prefix to standardize
//             const gradeNum = grade.replace('Grade ', '').replace('th', '').replace('st', '').replace('nd', '').replace('rd', '');
//             return `Grade ${gradeNum}`;
//         };

//         const formattedGrade = formatGradeLevel(gradeLevel);
//         console.log('Formatted grade level:', formattedGrade);

//         const subjects = GRADE_SUBJECTS[formattedGrade];
//         if (!subjects) {
//             throw new Error(`Invalid grade level: ${formattedGrade}`);
//         }

//         // Get current academic year
//         const currentYear = new Date().getFullYear();
//         const academicYear = `${currentYear}-${currentYear + 1}`;

//         // Create subjects if they don't exist
//         const subjectPromises = subjects.map(async (subjectTitle) => {
//             let subject = await Subject.findOne({
//                 title: subjectTitle,
//                 gradeLevel: formattedGrade
//             });

//             if (!subject) {
//                 try {
//                     subject = await Subject.create({
//                         title: subjectTitle,
//                         description: `${subjectTitle} for ${formattedGrade}`,
//                         duration: 60,
//                         level: formattedGrade.startsWith('Grade 9') || 
//                                formattedGrade.startsWith('Grade 10') || 
//                                formattedGrade.startsWith('Grade 11') || 
//                                formattedGrade.startsWith('Grade 12') 
//                                ? 'High School' 
//                                : formattedGrade.startsWith('Grade 6') || 
//                                  formattedGrade.startsWith('Grade 7') || 
//                                  formattedGrade.startsWith('Grade 8') 
//                                  ? 'Middle School' 
//                                  : 'Elementary',
//                         gradeLevel: formattedGrade,
//                         tutor: null, // You'll need to assign a tutor later
//                         enrollmentCapacity: 30,
//                         isActive: true
//                     });
//                     console.log(`Created new subject: ${subjectTitle} for ${formattedGrade}`);
//                 } catch (error) {
//                     console.error(`Error creating subject ${subjectTitle}:`, error);
//                     throw error;
//                 }
//             }
//             return subject;
//         });

//         const subjectDocs = await Promise.all(subjectPromises);

//         // Create enrollments for each subject
//         const enrollmentPromises = subjectDocs.map(subject => 
//             Enrollment.create({
//                 student: studentId,
//                 subject: subject._id,
//                 gradeLevel: formattedGrade,
//                 academicYear,
//                 status: 'active'
//             })
//         );

//         await Promise.all(enrollmentPromises);

//         // Update student's subjects array
//         student.subjects = subjectDocs.map(subject => subject._id);
//         await student.save();

//         return true;
//     } catch (error) {
//         console.error('Error in enrollStudentInGradeSubjects:', error);
//         throw error;
//     }
// };

const enrollStudentInGradeSubjects = async (studentId, gradeLevel) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Format grade level to "Grade X" format
        const formatGradeLevel = (grade) => {
            if (grade.startsWith('Grade')) return grade;
            const num = grade.replace('th', '').replace('st', '').replace('nd', '').replace('rd', '');
            return `Grade ${num}`;
        };

        const formattedGrade = formatGradeLevel(gradeLevel);
        console.log('Formatted grade level:', formattedGrade);

        const subjects = GRADE_SUBJECTS[formattedGrade];
        if (!subjects) {
            throw new Error(`Invalid grade level: ${formattedGrade}`);
        }

        // Get current academic year
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        // Create subjects if they don't exist
        const subjectPromises = subjects.map(async (subjectTitle) => {
            let subject = await Subject.findOne({
                title: subjectTitle,
                gradeLevel: formattedGrade
            });

            if (!subject) {
                subject = await Subject.create({
                    title: subjectTitle,
                    description: `${subjectTitle} for ${formattedGrade}`,
                    duration: 60,
                    level: parseInt(formattedGrade.split(' ')[1]) > 8 ? 'High School' : 
                           parseInt(formattedGrade.split(' ')[1]) > 5 ? 'Middle School' : 
                           'Elementary',
                    gradeLevel: formattedGrade,
                    enrollmentCapacity: 30,
                    isActive: true
                });
                console.log(`Created new subject: ${subjectTitle} for ${formattedGrade}`);
            }
            return subject;
        });

        const subjectDocs = await Promise.all(subjectPromises);
        console.log(`Created/Found ${subjectDocs.length} subjects`);

        // Create enrollments for each subject
        const enrollmentPromises = subjectDocs.map(async (subject) => {
            const existingEnrollment = await Enrollment.findOne({
                student: studentId,
                subject: subject._id,
                academicYear
            });

            if (!existingEnrollment) {
                return Enrollment.create({
                    student: studentId,
                    subject: subject._id,
                    gradeLevel: formattedGrade,
                    academicYear,
                    status: 'active'
                });
            }
            return existingEnrollment;
        });

        const enrollments = await Promise.all(enrollmentPromises);
        console.log(`Created ${enrollments.length} enrollments`);

        // Update student's subjects array
        student.subjects = subjectDocs.map(subject => subject._id);
        await student.save();

        return enrollments;
    } catch (error) {
        console.error('Error in enrollStudentInGradeSubjects:', error);
        throw error;
    }
};
module.exports = {
    enrollStudentInGradeSubjects,
    GRADE_SUBJECTS
};

