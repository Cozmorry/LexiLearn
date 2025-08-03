const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Quiz category is required'],
    enum: ['reading', 'spelling', 'comprehension', 'writing', 'vocabulary']
  },
  difficulty: {
    type: String,
    required: [true, 'Quiz difficulty is required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  gradeLevel: {
    type: String,
    required: [true, 'Grade level is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  },
  questions: [{
    type: {
      type: String,
      enum: ['multiple-choice', 'fill-blank', 'matching', 'drag-drop', 'typing'],
      required: true
    },
    question: {
      type: String,
      required: [true, 'Question text is required']
    },
    options: [{
      type: String
    }],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Correct answer is required']
    },
    explanation: {
      type: String,
      maxlength: [200, 'Explanation cannot be more than 200 characters']
    },
    points: {
      type: Number,
      default: 10,
      min: [1, 'Points must be at least 1']
    }
  }],
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  learningObjectives: [{
    type: String,
    maxlength: [200, 'Learning objective cannot be more than 200 characters']
  }],
  accessibility: {
    audioSupport: {
      type: Boolean,
      default: true
    },
    visualSupport: {
      type: Boolean,
      default: true
    },
    textToSpeech: {
      type: Boolean,
      default: true
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    dyslexiaFriendly: {
      type: Boolean,
      default: true
    }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Quiz creator is required']
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizSchema.index({ category: 1, difficulty: 1 });
quizSchema.index({ gradeLevel: 1 });
quizSchema.index({ isActive: 1 });
quizSchema.index({ createdBy: 1 });

// Virtual for total questions
quizSchema.virtual('totalQuestions').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  if (!this.questions) return 0;
  return this.questions.reduce((sum, question) => sum + (question.points || 10), 0);
});

// Instance method to calculate completion rate
quizSchema.methods.calculateCompletionRate = function() {
  // This would be calculated based on user progress
  return this.completionRate;
};

// Static method to find quizzes by category and grade
quizSchema.statics.findByCategoryAndGrade = function(category, gradeLevel) {
  return this.find({
    category,
    gradeLevel,
    isActive: true
  }).populate('createdBy', 'name');
};

// Static method to find quizzes for a specific student
quizSchema.statics.findForStudent = function(studentId, gradeLevel) {
  return this.find({
    $or: [
      { assignedTo: studentId },
      { gradeLevel, isActive: true }
    ]
  }).populate('createdBy', 'name');
};

module.exports = mongoose.model('Quiz', quizSchema); 