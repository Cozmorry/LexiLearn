const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ error: 'User account is deactivated' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Middleware to authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Middleware to check if user is teacher
const isTeacher = (req, res, next) => {

  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ 
      error: 'Access denied. Teacher access required.' 
    });
  }
  next();
};

// Middleware to check if user is student
const isStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ 
      error: 'Access denied. Student access required.' 
    });
  }
  next();
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin access required.' 
    });
  }
  next();
};

// Middleware to check if teacher can access student data
const canAccessStudent = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role === 'teacher') {
      const studentId = req.params.id || req.params.studentId || req.body.studentId;
      if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
      }

      const student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      if (student.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          error: 'Access denied. You can only access your own students.' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Student access check error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  protect,
  authorize,
  isTeacher,
  isStudent,
  isAdmin,
  canAccessStudent
}; 