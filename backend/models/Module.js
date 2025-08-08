const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Module description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Module category is required'],
    enum: ['Reading', 'Writing', 'Grammar', 'Vocabulary', 'Comprehension', 'Phonics', 'Literature', 'Creative Writing']
  },
  difficulty: {
    type: String,
    required: [true, 'Module difficulty is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  gradeLevel: {
    type: String,
    required: [true, 'Grade level is required'],
    enum: ['1', '2', '3']
  },
  estimatedTime: {
    type: Number,
    required: [true, 'Estimated time is required'],
    min: [1, 'Estimated time must be at least 1 minute']
  },
  objectives: {
    type: String,
    maxlength: [1000, 'Objectives cannot be more than 1000 characters']
  },
  prerequisites: {
    type: String,
    maxlength: [500, 'Prerequisites cannot be more than 500 characters']
  },
  materials: {
    type: String,
    maxlength: [500, 'Materials cannot be more than 500 characters']
  },
  instructions: {
    type: String,
    maxlength: [2000, 'Instructions cannot be more than 2000 characters']
  },
  assessment: {
    type: String,
    maxlength: [1000, 'Assessment cannot be more than 1000 characters']
  },
  photos: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  videos: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  content: {
    type: [{
      type: {
        type: String,
        enum: ['text', 'image', 'audio', 'video', 'interactive', 'quiz']
      },
      data: mongoose.Schema.Types.Mixed,
      order: Number,
      quizData: {
        question: String,
        options: [String],
        correctAnswer: Number,
        points: {
          type: Number,
          default: 10
        }
      },
      comprehensionQuestions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        points: {
          type: Number,
          default: 10
        }
      }]
    }],
    required: [true, 'Module content is required']
  },
  exercises: [{
    type: {
      type: String,
      enum: ['multiple-choice', 'fill-blank', 'matching', 'drag-drop', 'typing']
    },
    question: String,
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    explanation: String,
    points: {
      type: Number,
      default: 10
    }
  }],
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required']
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
    required: [true, 'Module creator is required']
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
moduleSchema.index({ category: 1, difficulty: 1 });
moduleSchema.index({ gradeLevel: 1 });
moduleSchema.index({ isActive: 1 });
moduleSchema.index({ createdBy: 1 });

// Virtual for module statistics
moduleSchema.virtual('totalExercises').get(function() {
  return this.exercises ? this.exercises.length : 0;
});

// Instance method to calculate completion rate
moduleSchema.methods.calculateCompletionRate = function() {
  // This would be calculated based on user progress
  return this.completionRate;
};

// Static method to find modules by category and grade
moduleSchema.statics.findByCategoryAndGrade = function(category, gradeLevel) {
  return this.find({
    category,
    gradeLevel,
    isActive: true
  }).populate('createdBy', 'name');
};

// Static method to find modules for a specific student
moduleSchema.statics.findForStudent = function(studentId, gradeLevel) {
  return this.find({
    $or: [
      { assignedTo: studentId },
      { 
        isActive: true,
        gradeLevel: gradeLevel
      }
    ]
  }).populate('createdBy', 'name');
};

module.exports = mongoose.model('Module', moduleSchema); 