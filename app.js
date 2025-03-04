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
const { connectWithRetry, setupConnectionHandlers } = require('./config/database');


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
const feePaymentRoutes = require('./routes/feePayment.route');
const testimonialRoutes = require('./routes/testimonial.route');




const app = express();
// app.enable('trust proxy');

// Logging 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}


// CORS
const corsOptions = {
    origin: [
        'https://www.clarenestschool.co.ke',
        'https://clarenestschool.co.ke',
        'https://clarenestfrontend-ohee.onrender.com',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));



app.options('*', cors());

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
    })
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true 
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

app.use('/api/auth', authRoutes);
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
app.use('/api/messages', messageRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fee-payment', feePaymentRoutes)
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/users', userRoutes);





app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

app.use(globalErrorHandler);

// Handle undefined Routes
app.use('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

mongoose.set('strictQuery', false);

// MongoDB
const startServer = async () => {
    const port = process.env.PORT || 5000;
    
    // Start server first
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
    });

    try {
        // Setup MongoDB connection handlers
        setupConnectionHandlers();
        
        // Attempt to connect to MongoDB
        await connectWithRetry();

        // Handle server shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);
            try {
                // Close MongoDB connection
                if (mongoose.connection.readyState === 1) {
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed');
                }
                
                // Exit process
                process.exit(0);
            } catch (err) {
                console.error('Error during shutdown:', err);
                process.exit(1);
            }
        };
        
        // Handle various shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        // process.on('uncaughtException', (err) => {
        //     console.error('Uncaught Exception:', err);
        //     gracefulShutdown('uncaughtException');
        // });
        // process.on('unhandledRejection', (err) => {
        //     console.error('Unhandled Rejection:', err);
        //     gracefulShutdown('unhandledRejection');
        // });

    } catch (error) {
        console.error('Failed to connect to database:', error);
        // Don't exit - let the server keep running even if DB connection fails
        console.log('Server will continue running and retry DB connection');
    }
};

startServer();
module.exports = app;