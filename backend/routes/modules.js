const express = require('express');
const { body, validationResult } = require('express-validator');
const Module = require('../models/Module');
const { protect, authorize, isTeacher } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/modules
// @desc    Get all modules (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty, gradeLevel, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (gradeLevel) filter.gradeLevel = gradeLevel;

    // If student, only show assigned modules or general modules
    if (req.user.role === 'student') {
      filter.$or = [
        { assignedTo: req.user._id },
        { isActive: true }
      ];
    }

    const modules = await Module.find(filter)
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Module.countDocuments(filter);

    res.json({
      success: true,
      modules,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/modules/:id
// @desc    Get specific module
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name grade');

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/modules
// @desc    Create new module
// @access  Private (Teachers only)
router.post('/', [
  protect,
  isTeacher,
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').isIn(['reading', 'spelling', 'comprehension', 'writing', 'vocabulary']).withMessage('Invalid category'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
  body('gradeLevel').isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']).withMessage('Invalid grade level'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be a positive number'),
  body('content').isArray({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const moduleData = {
      ...req.body,
      createdBy: req.user._id
    };

    const module = await Module.create(moduleData);

    res.status(201).json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/modules/:id
// @desc    Update module
// @access  Private (Teachers only)
router.put('/:id', [
  protect,
  isTeacher,
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').optional().isIn(['reading', 'spelling', 'comprehension', 'writing', 'vocabulary']).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
  body('gradeLevel').optional().isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']).withMessage('Invalid grade level'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check if teacher owns this module or is admin
    if (module.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this module' });
    }

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      module: updatedModule
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/modules/:id
// @desc    Delete module (soft delete)
// @access  Private (Teachers only)
router.delete('/:id', protect, isTeacher, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check if teacher owns this module or is admin
    if (module.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this module' });
    }

    await Module.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/modules/:id/assign
// @desc    Assign module to students
// @access  Private (Teachers only)
router.post('/:id/assign', [
  protect,
  isTeacher,
  body('studentIds').isArray({ min: 1 }).withMessage('At least one student must be selected')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentIds } = req.body;
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Add students to assignedTo array
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: { $each: studentIds } } },
      { new: true }
    );

    res.json({
      success: true,
      module: updatedModule
    });
  } catch (error) {
    console.error('Assign module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/modules/:id/assign
// @desc    Remove module assignment from students
// @access  Private (Teachers only)
router.delete('/:id/assign', [
  protect,
  isTeacher,
  body('studentIds').isArray({ min: 1 }).withMessage('At least one student must be selected')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentIds } = req.body;
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Remove students from assignedTo array
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignedTo: { $in: studentIds } } },
      { new: true }
    );

    res.json({
      success: true,
      module: updatedModule
    });
  } catch (error) {
    console.error('Remove module assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 