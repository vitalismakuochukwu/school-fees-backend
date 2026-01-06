const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// ADMIN: Update School Fee
router.post('/admin/update-fee', async (req, res) => {
  const { amount, secret } = req.body;
  
  // HARDCODED ADMIN SECRET KEY (Must match what you type in frontend)
  const ADMIN_SECRET = "mySuperSecretAdminKey123"; 

  console.log(`Update Fee Attempt - Received: '${secret}' | Expected: '${ADMIN_SECRET}'`);

  if (!secret || secret !== ADMIN_SECRET) {
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

// GET payment history for a student
router.get('/student/payments/:regNo', async (req, res) => {
  try {
    const { regNo } = req.params;
    const student = await Student.findOne({ regNo });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const payments = await Payment.find({ student: student._id })
      .sort({ date: -1 });  // Sort by date descending

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Route to mark fees as paid (example implementation, adapt as necessary)
router.post('/fees/mark-as-paid', async (req, res) => {
  const { regNo, session, amountPaid, reference } = req.body;

  try {
    const student = await Student.findOne({ regNo });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newPayment = new Payment({
      student: student._id,
      session,
      amountPaid,
      reference,
    });
    await newPayment.save();
    
    student.payments.push(newPayment._id);
    await student.save();

    res.status(201).json({ message: 'Payment recorded successfully', payment: newPayment });
  } catch (error) {
    console.error('Error marking fees as paid:', error);
    res.status(500).json({ message: 'Failed to mark fees as paid', error: error.message });
  }
});


module.exports = router;