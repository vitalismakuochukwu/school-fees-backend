const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

// 1. Route to get the current fee (Used by Student Dashboard & UpdateFee page)
// URL: GET https://school-fees-backend.onrender.com/api/fees/current
router.get('/current', feeController.getCurrentFee);

// 2. Route to mark a fee as paid (Used after Paystack payment is successful)
// URL: POST https://school-fees-backend.onrender.com/api/fees/pay
router.post('/pay', feeController.markAsPaid);

// This matches: POST https://school-fees-backend.onrender.com/api/fees/mark-as-paid
router.post('/mark-as-paid', feeController.markAsPaid);

module.exports = router;