const express = require('express');
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const Module = require('../models/Module');
const { protect, authorize, isTeacher, canAccessStudent } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get user's progress (student) or students' progress (teacher)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      // Get student's own progress
      const progress = await Progress.find({ studentId: req.user._id })
        .populate('moduleId', 'title category difficulty gradeLevel')
        .sort({ lastActivity: -1 });

      res.json({
        success: true,
        progress
      });
    } else if (req.user.role === 'teacher') {
      // Get progress for teacher's students
      const { studentId, moduleId, status } = req.query;
      
      const filter = {};
      if (studentId) filter.studentId = studentId;
      if (moduleId) filter.moduleId = moduleId;
      if (status) filter.status = status;

      // If no specific student, get all teacher's students
      if (!studentId) {
        const students = await require('../models/User').findStudentsByTeacher(req.user._id);
        filter.studentId = { $in: students.map(s => s._id) };
      }

      const progress = await Progress.find(filter)
        .populate('studentId', 'name grade')
        .populate('moduleId', 'title category difficulty')
        .sort({ lastActivity: -1 });

      res.json({
        success: true,
        progress
      });
    }
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/progress/:id
// @desc    Get specific progress record
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id)
      .populate('studentId', 'name grade')
      .populate('moduleId', 'title category difficulty exercises');

    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && progress.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'teacher') {
      const student = await require('../models/User').findById(progress.studentId._id);
      if (student.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get progress record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/progress
// @desc    Create or update progress
// @access  Private
router.post('/', [
  protect,
  body('moduleId').isMongoId().withMessage('Valid module ID is required'),
  body('currentStep').isInt({ min: 0 }).withMessage('Current step must be a non-negative integer'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moduleId, currentStep, score, timeSpent, exerciseResult } = req.body;

    // Get module to determine total steps
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const totalSteps = module.content.length;

    // Find existing progress or create new one
    let progress = await Progress.findOne({
      studentId: req.user._id,
      moduleId
    });

    if (!progress) {
      progress = new Progress({
        studentId: req.user._id,
        moduleId,
        totalSteps,
        currentStep,
        score: score || 0,
        timeSpent: timeSpent || 0
      });
    } else {
      // Update existing progress
      progress.currentStep = currentStep;
      if (score !== undefined) progress.score = score;
      if (timeSpent !== undefined) progress.timeSpent += timeSpent;
    }

    // Add exercise result if provided
    if (exerciseResult) {
      progress.exerciseResults.push(exerciseResult);
    }

    // Update status based on completion
    if (currentStep >= totalSteps) {
      progress.status = 'completed';
      progress.completionDate = new Date();
    } else if (progress.status === 'not-started') {
      progress.status = 'in-progress';
    }

    progress.lastActivity = new Date();
    await progress.save();

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Create/update progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/progress/:id
// @desc    Update progress record
// @access  Private
router.put('/:id', [
  protect,
  body('currentStep').optional().isInt({ min: 0 }).withMessage('Current step must be a non-negative integer'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('status').optional().isIn(['not-started', 'in-progress', 'completed', 'paused']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('teacherFeedback').optional().trim().isLength({ max: 1000 }).withMessage('Teacher feedback cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && progress.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'teacher') {
      const student = await require('../models/User').findById(progress.studentId);
      if (student.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const updatedProgress = await Progress.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastActivity: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      progress: updatedProgress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/progress/student/:studentId
// @desc    Get student's progress summary (Teachers only)
// @access  Private (Teachers only)
router.get('/student/:studentId', protect, isTeacher, canAccessStudent, async (req, res) => {
  try {
    const progressSummary = await Progress.getStudentProgress(req.params.studentId);
    
    const recentProgress = await Progress.find({ studentId: req.params.studentId })
      .populate('moduleId', 'title category')
      .sort({ lastActivity: -1 })
      .limit(5);

    res.json({
      success: true,
      summary: progressSummary[0] || {
        totalModules: 0,
        completedModules: 0,
        averageScore: 0,
        totalTimeSpent: 0
      },
      recentProgress
    });
  } catch (error) {
    console.error('Get student progress summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/progress/module/:moduleId
// @desc    Get module statistics (Teachers only)
// @access  Private (Teachers only)
router.get('/module/:moduleId', protect, isTeacher, async (req, res) => {
  try {
    const moduleStats = await Progress.getModuleStats(req.params.moduleId);
    
    const studentProgress = await Progress.find({ moduleId: req.params.moduleId })
      .populate('studentId', 'name grade')
      .sort({ lastActivity: -1 });

    res.json({
      success: true,
      stats: moduleStats[0] || {
        totalStudents: 0,
        completedStudents: 0,
        averageScore: 0,
        averageTimeSpent: 0
      },
      studentProgress
    });
  } catch (error) {
    console.error('Get module statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/progress/:id/exercise
// @desc    Add exercise result to progress
// @access  Private
router.post('/:id/exercise', [
  protect,
  body('exerciseIndex').isInt({ min: 0 }).withMessage('Exercise index is required'),
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('userAnswer').notEmpty().withMessage('User answer is required'),
  body('correctAnswer').notEmpty().withMessage('Correct answer is required'),
  body('isCorrect').isBoolean().withMessage('isCorrect must be boolean'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be non-negative'),
  body('explanation').optional().trim().isLength({ max: 200 }).withMessage('Explanation cannot exceed 200 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && progress.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add exercise result
    await progress.addExerciseResult(req.body);

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Add exercise result error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 