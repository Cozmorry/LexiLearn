const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
  body('grade').optional().isIn(['1st', '2nd', '3rd']).withMessage('Invalid grade level'),
  body('teacherId').optional().isMongoId().withMessage('Invalid teacher ID'),
  body('school').optional().trim().isLength({ max: 200 }).withMessage('School name cannot exceed 200 characters'),
  body('gradeLevel').optional().isIn(['K-2', '3-5', '6-8', '9-12']).withMessage('Invalid grade level'),
  body('subject').optional().isIn(['Reading', 'Writing', 'Language Arts', 'English', 'Special Education', 'Other']).withMessage('Invalid subject')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, grade, teacherId, school, gradeLevel, subject } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate role-specific requirements
    if (role === 'student') {
      if (!grade) {
        return res.status(400).json({ error: 'Grade is required for students' });
      }
      if (!teacherId) {
        return res.status(400).json({ error: 'Teacher ID is required for students' });
      }
      // Verify teacher exists
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ error: 'Invalid teacher ID' });
      }
    }

    if (role === 'teacher') {
      if (!gradeLevel) {
        return res.status(400).json({ error: 'Grade level is required for teachers' });
      }
      if (!subject) {
        return res.status(400).json({ error: 'Subject is required for teachers' });
      }
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role
    };

    // Add role-specific fields
    if (role === 'student') {
      userData.grade = grade;
      userData.teacherId = teacherId;
    } else if (role === 'teacher') {
      userData.gradeLevel = gradeLevel;
      userData.subject = subject;
      if (school) userData.school = school;
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/student-login
// @desc    Student login with secret code
// @access  Public
router.post('/student-login', [
  body('secretCode').isLength({ min: 9, max: 9 }).withMessage('Secret code must be 9 characters'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { secretCode, name } = req.body;

    // Find student by secret code
    const student = await User.findOne({ secretCode, role: 'student' });
    if (!student) {
      return res.status(401).json({ error: 'Invalid secret code' });
    }

    // Check if student is active
    if (!student.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Update name if provided
    if (name && name.trim() !== student.name) {
      student.name = name.trim();
    }

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    // Generate token
    const token = generateToken(student._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: student.getPublicProfile()
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // Update last login timestamp
    await User.findByIdAndUpdate(req.user.id, { lastLogin: new Date() });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 