const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizSubmissionSchema.index({ assignment: 1, student: 1 });
quizSubmissionSchema.index({ student: 1 });
quizSubmissionSchema.index({ completedAt: -1 });

// Static method to get student's best submission for an assignment
quizSubmissionSchema.statics.getBestSubmission = function(assignmentId, studentId) {
  return this.findOne({ assignment: assignmentId, student: studentId })
    .sort({ totalScore: -1, completedAt: -1 });
};

// Static method to get all submissions for an assignment
quizSubmissionSchema.statics.getAssignmentSubmissions = function(assignmentId) {
  return this.find({ assignment: assignmentId })
    .populate('student', 'name email grade')
    .sort({ completedAt: -1 });
};

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema); 