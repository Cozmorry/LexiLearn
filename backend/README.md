# LexiLearn Backend API

A comprehensive Node.js backend for the LexiLearn dyslexia learning platform, built with Express.js and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Student, Teacher, Admin)
  - Student login with secret codes
  - Password hashing with bcrypt

- **User Management**
  - Student and teacher registration
  - Profile management
  - Teacher-student relationships
  - User preferences and accessibility settings

- **Learning Module System**
  - Create and manage educational modules
  - Support for multiple content types (text, image, audio, video, interactive)
  - Module assignment to students
  - Accessibility features for dyslexia

- **Progress Tracking**
  - Real-time progress monitoring
  - Exercise result tracking
  - Time spent analytics
  - Completion statistics

- **Quiz System**
  - Multiple question types (multiple-choice, fill-blank, matching, drag-drop, typing)
  - Automatic scoring
  - Detailed result analysis
  - Teacher feedback system

- **Security & Performance**
  - Rate limiting
  - Input validation
  - CORS configuration
  - Helmet security headers
  - MongoDB indexing for performance

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running)
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lexilearn

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (for password reset, notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher",
  "grade": "3rd" // Required for students
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Student Login (with Secret Code)
```http
POST /api/auth/student-login
Content-Type: application/json

{
  "secretCode": "ABC123XYZ",
  "name": "Sarah" // Optional
}
```

### User Management

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "accessibility": {
      "fontSize": "large",
      "highContrast": true
    }
  }
}
```

### Teacher-Student Management

#### Get Teacher's Students
```http
GET /api/users/students
Authorization: Bearer <teacher_token>
```

#### Add New Student
```http
POST /api/users/students
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "name": "Sarah Johnson",
  "grade": "3rd"
}
```

### Module Management

#### Get Modules
```http
GET /api/modules?category=reading&difficulty=beginner&gradeLevel=3rd
Authorization: Bearer <token>
```

#### Create Module
```http
POST /api/modules
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Reading Fundamentals",
  "description": "Learn basic reading skills",
  "category": "reading",
  "difficulty": "beginner",
  "gradeLevel": "3rd",
  "estimatedDuration": 30,
  "content": [
    {
      "type": "text",
      "data": "Welcome to reading fundamentals...",
      "order": 1
    }
  ],
  "exercises": [
    {
      "type": "multiple-choice",
      "question": "What sound does 'A' make?",
      "options": ["ah", "ee", "oo", "ay"],
      "correctAnswer": "ah",
      "points": 10
    }
  ]
}
```

### Progress Tracking

#### Get Progress
```http
GET /api/progress
Authorization: Bearer <token>
```

#### Update Progress
```http
POST /api/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "moduleId": "module_id_here",
  "currentStep": 5,
  "score": 85,
  "timeSpent": 300
}
```

### Quiz System

#### Get Available Quizzes
```http
GET /api/quizzes
Authorization: Bearer <token>
```

#### Start Quiz
```http
POST /api/quizzes/:quizId/start
Authorization: Bearer <token>
```

#### Submit Quiz
```http
POST /api/quizzes/:quizId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": ["answer1", "answer2", "answer3"],
  "timeSpent": 600
}
```

## 🗄️ Database Schema

### User Model
- Basic info (name, email, password)
- Role-based access (student, teacher, admin)
- Student-specific fields (grade, secretCode, teacherId)
- Preferences (theme, notifications, accessibility)
- Timestamps and activity tracking

### Module Model
- Educational content with multiple types
- Exercise system with various question types
- Accessibility features for dyslexia
- Assignment system for students
- Statistics tracking

### Progress Model
- Student progress tracking
- Exercise result storage
- Time analytics
- Completion status
- Teacher feedback system

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Prevent abuse with request limiting
- **CORS Protection**: Configured for frontend access
- **Helmet Security**: HTTP headers for security
- **Role-based Access**: Granular permission system

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

- Morgan HTTP request logging
- Error handling middleware
- Console logging for debugging
- MongoDB query optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository. 