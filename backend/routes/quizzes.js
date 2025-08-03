const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const { protect, authorize, isStudent } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Get available quizzes for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    // If student, only show quizzes appropriate for their grade level
    if (req.user.role === 'student') {
      filter.gradeLevel = req.user.grade;
    }

    const quizzes = await Quiz.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Quiz.countDocuments(filter);

    res.json({
      success: true,
      quizzes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get specific quiz
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/start
// @desc    Start a quiz
// @access  Private (Students only)
router.post('/:id/start', [
  protect,
  isStudent
], async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if student has already started this quiz
    const existingProgress = await Progress.findOne({
      studentId: req.user._id,
      quizId: quiz._id
    });

    if (existingProgress) {
      return res.json({
        success: true,
        message: 'Quiz already started',
        progress: existingProgress
      });
    }

    // Create new progress record for this quiz
    const progress = await Progress.create({
      studentId: req.user._id,
      quizId: quiz._id,
      status: 'in-progress',
      currentStep: 0,
      totalSteps: quiz.questions.length,
      startDate: new Date()
    });

    res.json({
      success: true,
      message: 'Quiz started successfully',
      progress
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers
// @access  Private (Students only)
router.post('/:id/submit', [
  protect,
  isStudent,
  body('answers').isArray().withMessage('Answers must be an array'),
  body('timeSpent').isInt({ min: 0 }).withMessage('Time spent must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { answers, timeSpent } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      studentId: req.user._id,
      quizId: quiz._id
    });

    if (!progress) {
      progress = await Progress.create({
        studentId: req.user._id,
        quizId: quiz._id,
        status: 'in-progress',
        currentStep: 0,
        totalSteps: quiz.questions.length
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const exerciseResults = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.includes(userAnswer)
        : userAnswer === question.correctAnswer;

      if (isCorrect) correctAnswers++;

      exerciseResults.push({
        exerciseIndex: index,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timeSpent: timeSpent / quiz.questions.length,
        points: question.points,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Update progress
    progress.status = 'completed';
    progress.score = score;
    progress.timeSpent += timeSpent;
    progress.exerciseResults = exerciseResults;
    progress.completionDate = new Date();
    progress.lastActivity = new Date();

    await progress.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeSpent,
      progress
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id/results
// @desc    Get quiz results
// @access  Private
router.get('/:id/results', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      studentId: req.user._id,
      quizId: req.params.id
    }).populate('quizId');

    if (!progress) {
      return res.status(404).json({ error: 'Quiz results not found' });
    }

    res.json({
      success: true,
      results: progress
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/quizzes/student/:studentId
// @desc    Get student's quiz results (teachers only)
// @access  Private (Teachers only)
router.get('/student/:studentId', protect, authorize('teacher'), async (req, res) => {
  try {
    const progress = await Progress.find({
      studentId: req.params.studentId,
      quizId: { $exists: true }
    }).populate('quizId');

    res.json({
      success: true,
      results: progress
    });
  } catch (error) {
    console.error('Get student quiz results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 