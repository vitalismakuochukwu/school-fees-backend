const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');

// ADMIN: Update School Fee
router.post('/admin/update-fee', async (req, res) => {
  const { amount, secret } = req.body;
  
  // HARDCODED ADMIN SECRET KEY (Must match what you type in frontend)
  const ADMIN_SECRET = "mySuperSecretAdminKey123"; 

  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ message: "Invalid Admin Secret Key" });
  }

  try {
    let fee = await Fee.findOne();
    if (fee) {
      fee.amount = amount;
      fee.lastUpdated = Date.now();
      await fee.save();
    } else {
      fee = new Fee({ amount });
      await fee.save();
    }
    res.json({ message: "Fee updated successfully", amount: fee.amount });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// PUBLIC: Get Current School Fee
router.get('/fees/current', async (req, res) => {
  try {
    const fee = await Fee.findOne();
    const amount = fee ? fee.amount : 45500; // Default fallback
    res.json({ amount });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;