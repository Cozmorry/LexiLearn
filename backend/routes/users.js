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
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('school').optional().trim().isLength({ min: 2, max: 200 }).withMessage('School name must be between 2 and 200 characters'),
  body('gradeLevel').optional().isIn(['1', '2', '3']).withMessage('Grade level must be 1, 2, or 3'),
  body('subject').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Subject must be between 1 and 100 characters'),
  body('settings.theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Theme must be light, dark, or auto'),
  body('settings.notifications').optional().isBoolean().withMessage('Notifications must be boolean'),
  body('settings.accessibility.fontSize').optional().isIn(['small', 'medium', 'large']).withMessage('Font size must be small, medium, or large'),
  body('settings.accessibility.highContrast').optional().isBoolean().withMessage('High contrast must be boolean')
], async (req, res) => {
  try {
    console.log('Received profile update request:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, school, gradeLevel, subject, settings } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (school) updateData.school = school;
    if (gradeLevel) updateData.gradeLevel = gradeLevel;
    if (subject) updateData.subject = subject;
    
    console.log('Update data:', updateData);
    
    const fallbackSettings = {
      theme: 'light',
      notifications: { email: true, push: false },
      accessibility: { highContrast: false }
    };
    const userSettings = req.user.settings || req.user.preferences || fallbackSettings;
    if (settings) updateData.settings = { ...userSettings, ...settings };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: false }
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
      email: req.body.email,
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

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', [
  protect,
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Theme must be light, dark, or auto'),
  body('notifications.email').optional().isBoolean().withMessage('Email notifications must be boolean'),
  body('notifications.push').optional().isBoolean().withMessage('Push notifications must be boolean'),
  body('accessibility.highContrast').optional().isBoolean().withMessage('High contrast must be boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { theme, notifications, accessibility } = req.body;
    const updateData = {};

    if (theme) updateData['settings.theme'] = theme;
    if (notifications) {
      if (notifications.email !== undefined) updateData['settings.notifications.email'] = notifications.email;
      if (notifications.push !== undefined) updateData['settings.notifications.push'] = notifications.push;
    }
    if (accessibility) {
      if (accessibility.highContrast !== undefined) updateData['settings.accessibility.highContrast'] = accessibility.highContrast;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: updatedUser.getPublicProfile()
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Load user with password field for comparison
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// TEMPORARY: Backfill secretCode for all students missing it
router.post('/students/backfill-secret-codes', async (req, res) => {
  try {
    const User = require('../models/User');
    const students = await User.find({ role: 'student', $or: [ { secretCode: { $exists: false } }, { secretCode: null } ] });
    let updated = 0;
    for (const student of students) {
      student.secretCode = student.generateSecretCode();
      await student.save();
      updated++;
    }
    res.json({ success: true, updated });
  } catch (error) {
    console.error('Backfill secret codes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 