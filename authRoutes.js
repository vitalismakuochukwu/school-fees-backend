const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Auth Routes
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/verify-email', authController.verifyEmail);
router.post('/auth/resend-verification', authController.resendVerificationCode);

// Student Profile Routes (Protected)
router.get('/student/profile', protect, authController.getProfile);
router.put('/student/profile', protect, authController.updateProfile);

module.exports = router;