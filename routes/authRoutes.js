// 
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const Student = require('../models/Student'); // Imported to use inside the PUT route

// --- PUBLIC AUTH ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-email', authController.verifyEmail);
router.post('/auth/resend-verification', authController.resendVerificationCode);

// --- PROTECTED STUDENT PROFILE ROUTES ---

/**
 * GET PROFILE
 * Uses authMiddleware to verify JWT or Session
 */
router.get('/student/profile', authMiddleware, authController.getProfile);

/**
 * UPDATE PROFILE
 * This handles both Google and Manual users.
 * It checks if the user ID exists in the request (from JWT or Passport Session).
 */
router.put('/student/profile', authMiddleware, async (req, res) => {
    try {
        // --- THE KEY FIX ---
        // req.user is populated by your authMiddleware (for JWT) 
        // OR by Passport (for Google Sessions)
        const userId = req.user?.id || req.user?._id; 

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: No user found in session or token" });
        }

        // Update the student data
        // We use { new: true } to get the updated document back
        const updatedStudent = await Student.findByIdAndUpdate(
            userId,
            { $set: req.body },
            { new: true, runValidators: true } // runValidators ensures the new data is valid
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student record not found" });
        }

        // Return the updated student object
        res.json({
            message: "Profile updated successfully",
            student: updatedStudent
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: "Internal server error during profile update" });
    }
});

module.exports = router;