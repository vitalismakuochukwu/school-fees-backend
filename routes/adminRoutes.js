const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

// This matches: POST https://school-fees-backend.onrender.com/api/admin/update-fee
router.post('/update-fee', feeController.updateFee);

module.exports = router;