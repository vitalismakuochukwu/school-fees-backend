const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// GET /api/fees/current
router.get('/current', async (req, res) => {
  try {
    const fee = await Fee.findOne().sort({ createdAt: -1 });
    const amount = fee ? fee.amount : 45500; // Default fallback
    res.status(200).json({ amount });
  } catch (error) {
    console.error('Error fetching fee:', error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST /api/fees/update
router.post('/update', async (req, res) => {
  const { amount, secret } = req.body;
  const ADMIN_SECRET = "mySuperSecretAdminKey123"; // Ensure this matches your frontend

  if (!secret || secret !== ADMIN_SECRET) {
    return res.status(403).json({ message: "Invalid Admin Secret Key" });
  }

  try {
    // Create a new fee record to keep history, or update existing
    const newFee = await Fee.create({ amount });
    res.status(200).json({ message: "Fee updated successfully", amount: newFee.amount });
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// POST /api/fees/mark-as-paid
router.post('/mark-as-paid', async (req, res) => {
  const { regNo, level, amountPaid, reference } = req.body;

  try {
    const student = await Student.findOne({ regNo });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create payment object matching the embedded schema in Student.js
    const newPayment = {
      level: level || 'Unknown Level',
      amount: amountPaid,
      reference: reference,
      date: new Date(),
      status: 'Successful'
    };

    student.payments.push(newPayment);
    await student.save();

    res.status(200).json({ message: 'Payment recorded successfully', student });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Failed to mark fees as paid', error: error.message });
  }
});

module.exports = router;