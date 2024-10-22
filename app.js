// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const hpp = require('hpp');
// const passport = require('passport');
// const compression = require('compression');
// const morgan = require('morgan');
// const AppError = require('./utils/appError');
// const globalErrorHandler = require('./controller/error.controller');

// // Import routes
// const authRoutes = require('./routes/auth.route');
// const userRoutes = require('./routes/user.route');
// const lessonRoutes = require('./routes/lesson.route');
// const subjectRoutes = require('./routes/subject.route');
// const assignmentRoutes = require('./routes/assignment.route');
// const attendanceRoutes = require('./routes/attendance.route');
// const notificationRoutes = require('./routes/notification.route');
// const parentRoutes = require('./routes/parent.route');
// const progressRoutes = require('./routes/progress.route');
// const resultRoutes = require('./routes/result.route');
// const studentRoutes = require('./routes/student.route');
// const tutorRoutes = require('./routes/tutor.route');
// const dashboardRoutes = require('./routes/dashboard.route');
// const messageRoutes = require('./routes/message.route');
// const scheduleRoutes = require('./routes/schedule.route');
// const applicationRoutes = require('./routes/application.route');
// const scheduledTasks = require('./utils/scheduledTasks');
// const documentRoutes = require('./routes/document.route');

// const app = express();

// // Logging 
// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// } else {
//     app.use(morgan('combined'));
// }

// app.use(cors());
// app.options('*', cors());

// app.use(helmet());

// const limiter = rateLimit({
//     max: 100,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too many requests from this IP, please try again in an hour!'
// });
// app.use('/api', limiter);

// app.use(express.json({ limit: '10kb' }));

// app.use(mongoSanitize());

// app.use(xss());

// app.use(hpp({
//     whitelist: [
//         'duration',
//         'ratingsQuantity',
//         'ratingsAverage',
//         'maxGroupSize',
//         'difficulty',
//         'price'
//     ]
// }));

// app.use(compression());

// app.use(passport.initialize());
// require('./config/passport')(passport);

// app.get('/favicon.ico', (req, res) => res.status(204));

// scheduledTasks.scheduleOverdueFeeCheck();

// // Routes
// app.get('/', (req, res) => {
//     res.status(200).json({
//         message: 'Welcome to Clarenest International School'
//     })
// });

// app.use('/api', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/lessons', lessonRoutes);
// app.use('/api/subjects', subjectRoutes);
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/attendances', attendanceRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/parents', parentRoutes);
// app.use('/api/progresses', progressRoutes);
// app.use('/api/results', resultRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/tutors', tutorRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/schedules', scheduleRoutes);
// app.use('/api/applications', applicationRoutes);
// app.use('/api/documents', documentRoutes);

// app.use(globalErrorHandler);

// // Handle undefined Routes
// app.use('*', (req, res, next) => {
//     next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// // MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('Could not connect to MongoDB...', err));

// // Server
// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//     console.log(`App running on port ${port}...`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', err => {
//     console.log('UNHANDLED REJECTION! Shutting down...');
//     console.log(err.name, err.message);
//     server.close(() => {
//         process.exit(1);
//     });
// });

// // Handle SIGTERM
// process.on('SIGTERM', () => {
//     console.log('SIGTERM RECEIVED. Shutting down gracefully');
//     server.close(() => {
//         console.log('Process terminated!');
//     });
// });

// module.exports = app;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const passport = require('passport');
const compression = require('compression');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/error.controller');

// Import routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const lessonRoutes = require('./routes/lesson.route');
const subjectRoutes = require('./routes/subject.route');
const assignmentRoutes = require('./routes/assignment.route');
const attendanceRoutes = require('./routes/attendance.route');
const notificationRoutes = require('./routes/notification.route');
const parentRoutes = require('./routes/parent.route');
const progressRoutes = require('./routes/progress.route');
const resultRoutes = require('./routes/result.route');
const studentRoutes = require('./routes/student.route');
const tutorRoutes = require('./routes/tutor.route');
const dashboardRoutes = require('./routes/dashboard.route');
const messageRoutes = require('./routes/message.route');
const scheduleRoutes = require('./routes/schedule.route');
const applicationRoutes = require('./routes/application.route');
const scheduledTasks = require('./utils/scheduledTasks');
const documentRoutes = require('./routes/document.route');
const assessmentRoutes = require('./routes/assessment.route');


const app = express();

// Logging 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}
// Remove this
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
  };
app.use(cors(corsOptions));

// app.use(cors());
app.options('*', cors());

app.use(helmet());

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

app.use(compression());

app.use(passport.initialize());
require('./config/passport')(passport);

app.get('/favicon.ico', (req, res) => res.status(204));

scheduledTasks.scheduleOverdueFeeCheck();

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to Clarenest International School'
    })
});

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/progresses', progressRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/assessments', assessmentRoutes);


app.use(globalErrorHandler);

// Handle undefined Routes
app.use('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

// Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('Process terminated!');
    });
});

module.exports = app;