const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused'],
    default: 'not-started'
  },
  currentStep: {
    type: Number,
    default: 0
  },
  totalSteps: {
    type: Number,
    required: [true, 'Total steps is required']
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  exerciseResults: [{
    exerciseIndex: Number,
    question: String,
    userAnswer: mongoose.Schema.Types.Mixed,
    correctAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    timeSpent: Number,
    points: Number,
    explanation: String
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  teacherFeedback: {
    type: String,
    maxlength: [1000, 'Teacher feedback cannot be more than 1000 characters']
  },
  difficultyRating: {
    type: Number,
    min: 1,
    max: 5
  },
  enjoymentRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes for better query performance
progressSchema.index({ studentId: 1, moduleId: 1 }, { sparse: true });
progressSchema.index({ studentId: 1, quizId: 1 }, { sparse: true });
progressSchema.index({ studentId: 1, status: 1 });
progressSchema.index({ moduleId: 1, status: 1 });
progressSchema.index({ quizId: 1, status: 1 });

// Virtual for completion percentage
progressSchema.virtual('completionPercentage').get(function() {
  if (this.totalSteps === 0) return 0;
  return Math.round((this.currentStep / this.totalSteps) * 100);
});

// Virtual for average score
progressSchema.virtual('averageScore').get(function() {
  if (!this.exerciseResults || this.exerciseResults.length === 0) return 0;
  const totalPoints = this.exerciseResults.reduce((sum, result) => sum + (result.points || 0), 0);
  const earnedPoints = this.exerciseResults.reduce((sum, result) => sum + (result.isCorrect ? (result.points || 0) : 0), 0);
  return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
});

// Instance method to update progress
progressSchema.methods.updateProgress = function(step, score, timeSpent) {
  this.currentStep = step;
  this.score = score;
  this.timeSpent += timeSpent || 0;
  this.lastActivity = new Date();
  
  if (step >= this.totalSteps) {
    this.status = 'completed';
    this.completionDate = new Date();
  } else if (this.status === 'not-started') {
    this.status = 'in-progress';
  }
  
  return this.save();
};

// Instance method to add exercise result
progressSchema.methods.addExerciseResult = function(exerciseData) {
  this.exerciseResults.push(exerciseData);
  this.attempts += 1;
  this.lastActivity = new Date();
  return this.save();
};

// Static method to get student progress summary
progressSchema.statics.getStudentProgress = function(studentId) {
  return this.aggregate([
    { $match: { studentId: mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: null,
        totalModules: { $sum: { $cond: [{ $ne: ['$moduleId', null] }, 1, 0] } },
        totalQuizzes: { $sum: { $cond: [{ $ne: ['$quizId', null] }, 1, 0] } },
        completedModules: { $sum: { $cond: [{ $and: [{ $ne: ['$moduleId', null] }, { $eq: ['$status', 'completed'] }] }, 1, 0] } },
        completedQuizzes: { $sum: { $cond: [{ $and: [{ $ne: ['$quizId', null] }, { $eq: ['$status', 'completed'] }] }, 1, 0] } },
        averageScore: { $avg: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ]);
};

// Static method to get module statistics
progressSchema.statics.getModuleStats = function(moduleId) {
  return this.aggregate([
    { $match: { moduleId: mongoose.Types.ObjectId(moduleId) } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        completedStudents: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        averageScore: { $avg: '$score' },
        averageTimeSpent: { $avg: '$timeSpent' }
      }
    }
  ]);
};

// Static method to get quiz statistics
progressSchema.statics.getQuizStats = function(quizId) {
  return this.aggregate([
    { $match: { quizId: mongoose.Types.ObjectId(quizId) } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        completedStudents: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        averageScore: { $avg: '$score' },
        averageTimeSpent: { $avg: '$timeSpent' }
      }
    }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema); 