const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Reading', 'Writing', 'Grammar', 'Vocabulary', 'Comprehension', 'Phonics', 'Literature', 'Creative Writing']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
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
  dueDate: {
    type: Date,
    default: null
  },
  objectives: {
    type: String,
    trim: true,
    maxlength: [500, 'Objectives cannot be more than 500 characters']
  },
  prerequisites: {
    type: String,
    trim: true,
    maxlength: [500, 'Prerequisites cannot be more than 500 characters']
  },
  materials: {
    type: String,
    trim: true,
    maxlength: [500, 'Materials cannot be more than 500 characters']
  },
  instructions: {
    type: String,
    required: [true, 'Instructions are required'],
    trim: true,
    maxlength: [2000, 'Instructions cannot be more than 2000 characters']
  },
  assessment: {
    type: String,
    trim: true,
    maxlength: [500, 'Assessment criteria cannot be more than 500 characters']
  },
  content: [{
    type: {
      type: String,
      enum: ['text', 'interactive', 'quiz'],
      required: true
    },
    data: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    quizData: {
      question: String,
      options: [String],
      correctAnswer: Number,
      points: {
        type: Number,
        default: 10
      }
    }
  }],
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
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ category: 1 });
assignmentSchema.index({ gradeLevel: 1 });
assignmentSchema.index({ assignedTo: 1 });

// Static method to find assignments by teacher
assignmentSchema.statics.findByTeacher = function(teacherId) {
  return this.find({ createdBy: teacherId, isActive: true })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
};

// Static method to find assignments assigned to student
assignmentSchema.statics.findByStudent = function(studentId) {
  return this.find({ assignedTo: studentId, isActive: true, status: 'active' })
    .populate('createdBy', 'name')
    .sort({ dueDate: 1 });
};

module.exports = mongoose.model('Assignment', assignmentSchema); 