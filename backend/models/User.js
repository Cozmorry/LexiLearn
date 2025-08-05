const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() { return this.role !== 'student'; },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  grade: {
    type: String,
    enum: ['1', '2', '3', '1st', '2nd', '3rd'],
    required: function() { return this.role === 'student'; }
  },
  secretCode: {
    type: String,
    unique: true,
    sparse: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.role === 'student'; }
  },
  // Teacher-specific fields
  school: {
    type: String,
    trim: true,
    maxlength: [200, 'School name cannot be more than 200 characters']
  },
  gradeLevel: {
    type: String,
    enum: ['1', '2', '3'],
    required: function() { return this.role === 'teacher'; }
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters'],
    required: function() { return this.role === 'teacher'; }
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    accessibility: {
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      highContrast: {
        type: Boolean,
        default: false
      },
      screenReader: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ teacherId: 1 });
userSchema.index({ secretCode: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate secret code for students
userSchema.pre('save', function(next) {
  if (this.role === 'student' && !this.secretCode) {
    this.secretCode = this.generateSecretCode();
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate secret code
userSchema.methods.generateSecretCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Instance method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  if (userObject.role !== 'student') {
    delete userObject.secretCode;
  }
  return userObject;
};

// Static method to find all teachers
userSchema.statics.findTeachers = function() {
  return this.find({ role: 'teacher', isActive: true })
    .select('name email school gradeLevel subject avatar')
    .sort({ name: 1 });
};

// Static method to find students by teacher
userSchema.statics.findStudentsByTeacher = function(teacherId) {
  return this.find({ teacherId, role: 'student', isActive: true })
    .select('name email grade secretCode avatar lastLogin role')
    .sort({ name: 1 });
};

module.exports = mongoose.model('User', userSchema); 