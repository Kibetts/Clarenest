# Clarenest International School Learning Management System - Backend

## Overview
This is the backend server implementation for Clarenest International School's Learning Management System. The system provides a comprehensive platform for managing educational activities, including student enrollment, course management, attendance tracking, assessment handling, and various administrative functions.

## Features

### User Management
- Multi-role authentication (Admin, Tutor, Student, Parent)
- JWT-based authentication
- Email verification system
- Password reset functionality
- User profile management

### Academic Management
- Course and subject management
- Lesson scheduling and tracking
- Assignment creation and submission
- Assessment management
- Progress tracking
- Attendance monitoring
- Grade management

### Administrative Features
- Student application processing
- Tutor application handling
- Fee management
- Document management
- Notification system
- Messaging system
- Dashboard analytics

### Parent Portal
- Child progress monitoring
- Fee payment tracking
- Communication with tutors
- Attendance tracking

## Technology Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with Passport.js
- **Email Service:** SendGrid
- **File Upload:** Multer
- **Validation:** Joi
- **Security Packages:**
  - helmet
  - cors
  - xss-clean
  - express-rate-limit
  - express-mongo-sanitize

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- SendGrid API Key
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [project-directory]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
EMAIL_FROM=your_email@domain.com
SENDGRID_API_KEY=your_sendgrid_api_key
FRONTEND_URL=http://localhost:3000
```

4. Start the server:
```bash
npm start
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgotPassword` - Request password reset
- `PATCH /api/auth/resetPassword/:token` - Reset password

### User Management Endpoints
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Academic Endpoints
- `GET /api/lessons` - Get all lessons
- `POST /api/lessons` - Create new lesson
- `GET /api/subjects` - Get all subjects
- `POST /api/assignments` - Create assignment
- `GET /api/assessments` - Get assessments

### Application Endpoints
- `POST /api/applications/student` - Submit student application
- `POST /api/applications/tutor` - Submit tutor application
- `GET /api/applications` - Get all applications (Admin only)

For a complete list of endpoints and their documentation, please refer to the API documentation.

## Security Implementations

- JWT-based authentication
- Rate limiting
- XSS protection
- MongoDB injection prevention
- CORS configuration
- Helmet security headers
- Request sanitization
- Password encryption
- File upload validation

## Error Handling

The application implements a global error handling system with:
- Operational vs Programming error distinction
- Development vs Production error responses
- Custom error classes
- Async error catching
- Validation error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License 

## Support

For support, email koskebrian@hotmail.com .

## Authors

- Development - Brian Kibet

