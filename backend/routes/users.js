const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, isTeacher, canAccessStudent } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('preferences.theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark'),
  body('preferences.notifications').optional().isBoolean().withMessage('Notifications must be boolean'),
  body('preferences.accessibility.fontSize').optional().isIn(['small', 'medium', 'large']).withMessage('Font size must be small, medium, or large'),
  body('preferences.accessibility.highContrast').optional().isBoolean().withMessage('High contrast must be boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: updatedUser.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/students
// @desc    Get students for current teacher
// @access  Private (Teachers only)
router.get('/students', protect, isTeacher, async (req, res) => {
  try {
    const students = await User.findStudentsByTeacher(req.user._id);
    
    res.json({
      success: true,
      count: students.length,
      students: students.map(student => student.getPublicProfile())
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users/students
// @desc    Add a new student for current teacher
// @access  Private (Teachers only)
router.post('/students', [
  protect,
  isTeacher,
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('grade').isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']).withMessage('Invalid grade level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, grade } = req.body;

    // Create student
    const student = await User.create({
      name,
      grade,
      role: 'student',
      teacherId: req.user._id,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@lexilearn.student` // Temporary email
    });

    res.status(201).json({
      success: true,
      student: student.getPublicProfile()
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/students/:id
// @desc    Get specific student details
// @access  Private (Teachers only)
router.get('/students/:id', protect, isTeacher, canAccessStudent, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      student: student.getPublicProfile()
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/students/:id
// @desc    Update student information
// @access  Private (Teachers only)
router.put('/students/:id', [
  protect,
  isTeacher,
  canAccessStudent,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('grade').optional().isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']).withMessage('Invalid grade level'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, grade, isActive } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (grade) updateData.grade = grade;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      student: updatedStudent.getPublicProfile()
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/users/students/:id
// @desc    Delete student (soft delete)
// @access  Private (Teachers only)
router.delete('/students/:id', protect, isTeacher, canAccessStudent, async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student deactivated successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/teachers
// @desc    Get all teachers
// @access  Private (Admin only)
router.get('/teachers', protect, authorize('admin'), async (req, res) => {
  try {
    const teachers = await User.findTeachers();
    
    res.json({
      success: true,
      count: teachers.length,
      teachers: teachers.map(teacher => teacher.getPublicProfile())
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    const users = await User.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users: users.map(user => user.getPublicProfile()),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 