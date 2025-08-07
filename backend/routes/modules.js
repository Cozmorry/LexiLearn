const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Module = require('../models/Module');
const { protect, authorize, isTeacher } = require('../middleware/auth');

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
    fileSize: 100 * 1024 * 1024 // 100MB limit
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
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
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

// @route   GET /api/modules
// @desc    Get all modules (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty, gradeLevel, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (gradeLevel) filter.gradeLevel = gradeLevel;

    // If student, filter by grade level and show assigned modules or modules matching their grade
    if (req.user.role === 'student') {
      // Convert student grade to module grade level format
      let studentGradeLevel;
      if (req.user.grade) {
        // Handle different grade formats: '1st', '2nd', '3rd' -> '1', '2', '3'
        if (req.user.grade.includes('st') || req.user.grade.includes('nd') || req.user.grade.includes('rd')) {
          studentGradeLevel = req.user.grade.replace(/\D/g, ''); // Extract just the number
        } else {
          studentGradeLevel = req.user.grade;
        }
      }

      // Build filter for students
      const studentFilter = {
        $or: [
          { assignedTo: req.user._id }, // Modules specifically assigned to this student
          { 
            isActive: true,
            gradeLevel: studentGradeLevel // Modules matching student's grade level
          }
        ]
      };

      // Merge with existing filters
      Object.assign(filter, studentFilter);
    }

    const modules = await Module.find(filter)
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Module.countDocuments(filter);

    res.json({
      success: true,
      modules,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/modules/:id
// @desc    Get specific module
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name grade');

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/modules
// @desc    Create new module
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
  body('estimatedTime').isInt({ min: 1 }).withMessage('Estimated time must be a positive number')
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
        console.log('Received content:', JSON.stringify(content, null, 2));
      } catch (error) {
        return res.status(400).json({ error: 'Invalid content format' });
      }
    }

    // Automatically convert uploaded videos into learning content
    if (videos.length > 0) {
      const videoContent = videos.map((video, index) => ({
        type: 'video',
        data: video.filename,
        order: content.length + index + 1,
        videoInfo: {
          originalName: video.originalName,
          mimetype: video.mimetype,
          size: video.size
        }
      }));
      
      // Add video content to existing content
      content = [...content, ...videoContent];
    }

    // Parse exercises from JSON string if provided
    let exercises = [];
    if (req.body.exercises) {
      try {
        exercises = JSON.parse(req.body.exercises);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid exercises format' });
      }
    }

    const moduleData = {
      ...req.body,
      photos,
      videos,
      content,
      exercises,
      createdBy: req.user._id,
      estimatedDuration: req.body.estimatedTime // Map estimatedTime to estimatedDuration
    };

    const module = await Module.create(moduleData);

    res.status(201).json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/modules/:id
// @desc    Update module
// @access  Private (Teachers only)
router.put('/:id', [
  protect,
  isTeacher,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'videos', maxCount: 10 }
  ]),
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').optional().isIn(['Reading', 'Writing', 'Grammar', 'Vocabulary', 'Comprehension', 'Phonics', 'Literature', 'Creative Writing']).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty'),
  body('gradeLevel').optional().isIn(['1', '2', '3']).withMessage('Invalid grade level'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], handleMulterError, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check if teacher owns this module or is admin
    if (module.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this module' });
    }

    // Process uploaded files
    let photos = [];
    let videos = [];
    let content = [];

    // Parse content from JSON string if provided
    if (req.body.content) {
      try {
        content = JSON.parse(req.body.content);
        console.log('Received content:', JSON.stringify(content, null, 2));
      } catch (error) {
        return res.status(400).json({ error: 'Invalid content format' });
      }
    }

    // Process photos
    if (req.files && req.files.photos) {
      photos = req.files.photos.map(photo => ({
        filename: photo.filename,
        originalName: photo.originalname,
        path: photo.path,
        mimetype: photo.mimetype,
        size: photo.size
      }));
      
      // Add photo content to existing content
      const photoContent = photos.map((photo, index) => ({
        type: 'image',
        data: photo.filename,
        order: content.length + index + 1,
        imageInfo: {
          originalName: photo.originalName,
          mimetype: photo.mimetype,
          size: photo.size
        }
      }));
      
      // Add photo content to existing content
      content = [...content, ...photoContent];
    }

    // Process videos
    if (req.files && req.files.videos) {
      videos = req.files.videos.map(video => ({
        filename: video.filename,
        originalName: video.originalname,
        path: video.path,
        mimetype: video.mimetype,
        size: video.size
      }));
      
      // Add video content to existing content
      const videoContent = videos.map((video, index) => ({
        type: 'video',
        data: video.filename,
        order: content.length + index + 1,
        videoInfo: {
          originalName: video.originalName,
          mimetype: video.mimetype,
          size: video.size
        }
      }));
      
      // Add video content to existing content
      content = [...content, ...videoContent];
    }

    // Parse exercises from JSON string if provided
    let exercises = module.exercises || [];
    if (req.body.exercises) {
      try {
        exercises = JSON.parse(req.body.exercises);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid exercises format' });
      }
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      content,
      exercises
    };

    // Only add photos/videos if new files were uploaded
    if (photos.length > 0) {
      updateData.photos = photos;
    }
    if (videos.length > 0) {
      updateData.videos = videos;
    }

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      module: updatedModule
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/modules/:id
// @desc    Delete module (soft delete)
// @access  Private (Teachers only)
router.delete('/:id', protect, isTeacher, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check if teacher owns this module or is admin
    if (module.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this module' });
    }

    await Module.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/modules/:id/assign
// @desc    Assign module to students
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
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Add students to assignedTo array
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: { $each: studentIds } } },
      { new: true }
    );

    res.json({
      success: true,
      module: updatedModule
    });
  } catch (error) {
    console.error('Assign module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/modules/:id/assign
// @desc    Remove module assignment from students
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
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Remove students from assignedTo array
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignedTo: { $in: studentIds } } },
      { new: true }
    );

    res.json({
      success: true,
      module: updatedModule
    });
  } catch (error) {
    console.error('Remove module assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router; 