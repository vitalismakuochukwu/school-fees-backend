const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route to get current fee
router.get('/current', feeController.getCurrentFee);

// Protected route to mark payment as paid
router.post('/mark-as-paid', authMiddleware, feeController.markAsPaid);

module.exports = router;