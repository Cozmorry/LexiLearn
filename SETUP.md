# LexiLearn Setup Guide

Welcome to LexiLearn! This guide will help you set up the complete application with both frontend and backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Set Up Environment Variables

#### Backend Setup
```bash
cd backend
cp env.example .env
```

Edit `backend/.env`:
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
```

#### Frontend Setup
```bash
cd frontend
cp env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

## 📁 Project Structure

```
LexiLearn/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── services/        # API service functions
│   │   └── components/      # Reusable components
│   └── package.json
├── backend/                  # Node.js backend
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Authentication middleware
│   └── package.json
└── package.json             # Root package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Teacher login
- `POST /api/auth/student-login` - Student login with secret code
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/students` - Get teacher's students
- `POST /api/users/students` - Add new student

### Modules
- `GET /api/modules` - Get all modules
- `POST /api/modules` - Create module
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module

### Progress Tracking
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress
- `GET /api/progress/student/:id` - Get student progress

### Quizzes
- `GET /api/quizzes` - Get available quizzes
- `POST /api/quizzes/:id/start` - Start quiz
- `POST /api/quizzes/:id/submit` - Submit quiz

## 👥 User Roles

### Students
- Login with secret code (9 characters)
- Access assigned modules and quizzes
- Track learning progress
- View personalized dashboard

### Teachers
- Login with email/password
- Manage students
- Create and assign modules
- View student progress and analytics
- Access teacher dashboard

## 🗄️ Database Collections

### Users
- Students with secret codes
- Teachers with email/password
- Role-based access control

### Modules
- Educational content
- Multiple content types (text, image, audio, video)
- Exercises and quizzes
- Accessibility features

### Progress
- Student learning progress
- Exercise results
- Time tracking
- Completion statistics

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- Rate limiting
- CORS protection

## 🎨 Frontend Features

- Responsive design with Tailwind CSS
- Student and teacher dashboards
- Real-time progress tracking
- Accessibility features for dyslexia
- Modern UI with smooth transitions

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build frontend
npm run build

# Start backend
npm start
```

### Docker (Optional)
```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### Frontend
- Open http://localhost:3000
- Test student login with secret code
- Test teacher login with email/password

## 📝 Sample Data

### Create a Teacher
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ms. Johnson",
    "email": "teacher@lexilearn.com",
    "password": "password123",
    "role": "teacher"
  }'
```

### Create a Student
```bash
curl -X POST http://localhost:5000/api/users/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Smith",
    "grade": "3rd"
  }'
```

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in backend/.env

2. **CORS Error**
   - Verify FRONTEND_URL in backend/.env
   - Check NEXT_PUBLIC_API_URL in frontend/.env.local

3. **Port Already in Use**
   - Change PORT in backend/.env
   - Update NEXT_PUBLIC_API_URL accordingly

4. **Module Not Found**
   - Run `npm run install:all`
   - Check node_modules in both directories

### Logs
- Backend logs: Check terminal running backend
- Frontend logs: Check browser console
- Database logs: Check MongoDB logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, please:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

---

**Happy Learning with LexiLearn! 🎓** 