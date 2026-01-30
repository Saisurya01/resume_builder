const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create new resume (JSON data -> PDF)
router.post('/generate', resumeController.createResume);

// Upload existing resume for optimization
router.post('/upload', upload.single('resume'), resumeController.uploadResume);

// Optimize resume based on JD
router.post('/optimize', resumeController.optimizeResume);

// Apply selected optimizations to resume data
router.post('/apply-optimizations', resumeController.applyOptimizations);

module.exports = router;
