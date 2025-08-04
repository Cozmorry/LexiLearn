const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const QuizSubmission = require('../models/QuizSubmission');
const { protect, authorize, isTeacher, isStudent } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'photos') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for photos'), false);
      }
    } else if (file.fieldname === 'videos') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for videos'), false);
      }
    } else {
      cb(new Error('Unexpected field'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded.' });
    }
    return res.status(400).json({ error: error.message });
  }
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
};

// @route   GET /api/assignments
// @desc    Get all assignments (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('GET /api/assignments - User:', req.user);
    const { category, difficulty, gradeLevel, status, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (status) filter.status = status;

    // If student, only show assigned assignments
    if (req.user.role === 'student') {
      filter.assignedTo = req.user._id;
      filter.status = 'active';
    } else if (req.user.role === 'teacher') {
      // Teachers see their own assignments
      filter.createdBy = req.user._id;
    }

    console.log('Filter:', filter);

    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Assignment.countDocuments(filter);

    console.log('Found assignments:', assignments.length);

    res.json({
      success: true,
      assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get specific assignment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email grade');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user has access to this assignment
    if (req.user.role === 'student' && !assignment.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'teacher' && assignment.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (Teachers only)
router.post('/', [
  protect,
  isTeacher,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  handleMulterError,
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['Reading', 'Writing', 'Grammar', 'Vocabulary', 'Comprehension', 'Phonics', 'Literature', 'Creative Writing']).withMessage('Invalid category'),
  body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty'),
  body('gradeLevel').isIn(['1', '2', '3']).withMessage('Invalid grade level'),
  body('estimatedTime').isInt({ min: 1 }).withMessage('Estimated time must be a positive number'),
  body('instructions').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Instructions must be between 10 and 2000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Process uploaded files
    const photos = [];
    const videos = [];

    if (req.files) {
      if (req.files.photos) {
        req.files.photos.forEach(file => {
          photos.push({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          });
        });
      }

      if (req.files.videos) {
        req.files.videos.forEach(file => {
          videos.push({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          });
        });
      }
    }

    // Parse content from JSON string if provided
    let content = [];
    if (req.body.content) {
      try {
        content = JSON.parse(req.body.content);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid content format' });
      }
    }

    const assignmentData = {
      ...req.body,
      photos,
      videos,
      content,
      createdBy: req.user._id,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
    };

    const assignment = await Assignment.create(assignmentData);

    res.status(201).json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Teachers only)
router.put('/:id', [
  protect,
  isTeacher,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  handleMulterError,
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['Reading', 'Writing', 'Grammar', 'Vocabulary', 'Comprehension', 'Phonics', 'Literature', 'Creative Writing']).withMessage('Invalid category'),
  body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty'),
  body('gradeLevel').isIn(['1', '2', '3']).withMessage('Invalid grade level'),
  body('estimatedTime').isInt({ min: 1 }).withMessage('Estimated time must be a positive number'),
  body('instructions').trim().isLength({ min: 10, max: 2000 }).withMessage('Instructions must be between 10 and 2000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user owns this assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Process uploaded files
    const photos = [...assignment.photos];
    const videos = [...assignment.videos];

    if (req.files) {
      if (req.files.photos) {
        req.files.photos.forEach(file => {
          photos.push({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          });
        });
      }

      if (req.files.videos) {
        req.files.videos.forEach(file => {
          videos.push({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          });
        });
      }
    }

    // Parse content from JSON string if provided
    let content = assignment.content;
    if (req.body.content) {
      try {
        content = JSON.parse(req.body.content);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid content format' });
      }
    }

    const updateData = {
      ...req.body,
      photos,
      videos,
      content,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
    };

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name');

    res.json({
      success: true,
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Teachers only)
router.delete('/:id', [protect, isTeacher], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user owns this assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete by setting isActive to false
    await Assignment.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/assign
// @desc    Assign assignment to students
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
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user owns this assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add students to assignedTo array
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: { $each: studentIds } } },
      { new: true }
    ).populate('createdBy', 'name');

    res.json({
      success: true,
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Assign assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id/assign
// @desc    Remove assignment assignment from students
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
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user owns this assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove students from assignedTo array
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignedTo: { $in: studentIds } } },
      { new: true }
    ).populate('createdBy', 'name');

    res.json({
      success: true,
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Remove assignment assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/assignments/:id/quiz
// @desc    Get quiz questions for an assignment
// @access  Private (Students only)
router.get('/:id/quiz', [protect, isStudent], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if student is assigned to this assignment
    if (!assignment.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Extract quiz questions from content
    const quizQuestions = assignment.content
      .filter(item => item.type === 'quiz')
      .map((item, index) => ({
        questionIndex: index,
        question: item.quizData.question,
        options: item.quizData.options,
        points: item.quizData.points
      }));

    res.json({
      success: true,
      quizQuestions,
      assignmentTitle: assignment.title,
      totalQuestions: quizQuestions.length
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/quiz/submit
// @desc    Submit quiz answers and get auto-graded results
// @access  Private (Students only)
router.post('/:id/quiz/submit', [
  protect,
  isStudent,
  body('answers').isArray({ min: 1 }).withMessage('Answers are required'),
  body('timeSpent').isInt({ min: 0 }).withMessage('Time spent must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { answers, timeSpent } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if student is assigned to this assignment
    if (!assignment.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get quiz questions from assignment content
    const quizQuestions = assignment.content.filter(item => item.type === 'quiz');
    
    if (quizQuestions.length === 0) {
      return res.status(400).json({ error: 'No quiz questions found in this assignment' });
    }

    // Grade the answers
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    quizQuestions.forEach((question, index) => {
      const studentAnswer = answers.find(a => a.questionIndex === index);
      const isCorrect = studentAnswer && studentAnswer.selectedAnswer === question.quizData.correctAnswer;
      const points = isCorrect ? question.quizData.points : 0;
      
      totalScore += points;
      maxScore += question.quizData.points;

      gradedAnswers.push({
        questionIndex: index,
        selectedAnswer: studentAnswer ? studentAnswer.selectedAnswer : null,
        isCorrect,
        points
      });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Save the quiz submission
    const quizSubmission = await QuizSubmission.create({
      assignment: assignment._id,
      student: req.user._id,
      answers: gradedAnswers,
      totalScore,
      maxScore,
      percentage,
      timeSpent
    });

    res.json({
      success: true,
      submission: quizSubmission,
      results: {
        totalScore,
        maxScore,
        percentage,
        correctAnswers: gradedAnswers.filter(a => a.isCorrect).length,
        totalQuestions: quizQuestions.length
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/assignments/:id/quiz/results
// @desc    Get quiz results for a student
// @access  Private (Students and Teachers)
router.get('/:id/quiz/results', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check access permissions
    if (req.user.role === 'student') {
      if (!assignment.assignedTo.includes(req.user._id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // Get student's own results
      const submission = await QuizSubmission.getBestSubmission(req.params.id, req.user._id);
      
      if (!submission) {
        return res.status(404).json({ error: 'No quiz submission found' });
      }

      res.json({
        success: true,
        submission
      });
    } else if (req.user.role === 'teacher') {
      if (assignment.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // Get all student submissions for this assignment
      const submissions = await QuizSubmission.getAssignmentSubmissions(req.params.id);
      
      res.json({
        success: true,
        submissions
      });
    }
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/assignments/student/:studentId/submissions
// @desc    Get all quiz submissions for a specific student (for performance tracking)
// @access  Private (Teachers only)
router.get('/student/:studentId/submissions', [protect, isTeacher], async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get all quiz submissions for this student
    const submissions = await QuizSubmission.find({ student: studentId })
      .populate('assignment', 'title category gradeLevel')
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get student submissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 