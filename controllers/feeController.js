const Student = require('../models/Student');
const Fee = require('../models/Fee');

// 1. Fetch current fee (Matches what your dashboard needs)
const getCurrentFee = async (req, res) => {
  try {
    // Specifically look for 'Year 1' to match your UpdateFee frontend
    let fee = await Fee.findOne({ level: "Year 1" });
    
    // Fallback: If no 'Year 1' exists, create a default one
    if (!fee) {
      fee = await Fee.create({ amount: 45500, level: "Year 1", session: "2025/2026" });
    }
    
    res.status(200).json(fee);
  } catch (error) {
    console.error("Error in getCurrentFee:", error);
    res.status(500).json({ error: "Failed to fetch fee" });
  }
};

// 2. Admin update logic
const updateFee = async (req, res) => {
  const { amount, secret, level } = req.body;
  const targetLevel = level || "Year 1";

  // Security check
  const ADMIN_SECRET = process.env.ADMIN_SECRET || "fallback-secret";
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ message: "Unauthorized: Invalid Secret Key" });
  }

  try {
    // Upsert: true means if 'Year 1' doesn't exist, it creates it
    const fee = await Fee.findOneAndUpdate(
      { level: targetLevel }, 
      { amount: amount }, 
      { new: true, upsert: true }
    );
    res.status(200).json({ message: "Fee updated successfully", amount: fee.amount });
  } catch (error) {
    res.status(500).json({ message: "Failed to update fee", error: error.message });
  }
};

// 3. Mark fee as paid (For the Paystack callback)
const markAsPaid = async (req, res) => {
  const { regNo, level, amountPaid, reference } = req.body;

  try {
    const student = await Student.findOneAndUpdate(
      { regNo: regNo }, 
      { 
        $push: { 
          payments: { 
            level: level, 
            amount: amountPaid, 
            reference: reference, 
            date: new Date() // Standard Date object (Fixes the Cast to Date error)
          } 
        } 
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found with RegNo: " + regNo });
    }

    res.status(200).json({ success: true, payments: student.payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { markAsPaid, getCurrentFee, updateFee };