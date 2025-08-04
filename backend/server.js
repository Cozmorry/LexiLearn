const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const moduleRoutes = require('./routes/modules');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quizzes');
const assignmentRoutes = require('./routes/assignments');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
      mediaSrc: ["'self'", "data:", "blob:", "http:", "https:"],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined'));

// No global body parsing middleware - handle at route level

// Static file serving for uploads
app.use('/api/modules/uploads', (req, res, next) => {
  console.log('Static file request:', req.url);
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Test endpoint to verify uploads directory
app.get('/api/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, 'uploads');
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      success: true, 
      files,
      uploadsDir: uploadsDir
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message,
      uploadsDir: uploadsDir
    });
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lexilearn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Add body parsing middleware to routes that need it
app.use('/api/auth', express.json(), express.urlencoded({ extended: true }), authRoutes);
app.use('/api/users', express.json(), express.urlencoded({ extended: true }), userRoutes);
app.use('/api/modules', express.json(), express.urlencoded({ extended: true }), moduleRoutes);
app.use('/api/progress', express.json(), express.urlencoded({ extended: true }), progressRoutes);
app.use('/api/quizzes', express.json(), express.urlencoded({ extended: true }), quizRoutes);
app.use('/api/assignments', assignmentRoutes); // No body parsing for assignments (handles multipart)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LexiLearn API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`LexiLearn backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 