const Student = require('../models/Student');
const Fee = require('../models/Fee');

const markAsPaid = async (req, res) => {
  const { regNo, level, amountPaid, reference } = req.body;

  try {
    // This finds the student by regNo and ADDS (pushes) the payment to the array
    const student = await Student.findOneAndUpdate(
      { regNo: regNo }, 
      { 
        $push: { 
          payments: { 
            level: level, 
            amount: amountPaid, 
            reference: reference, 
            date: new Date() 
          } 
        } 
      },
      { new: true } // returns the updated student data
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found with RegNo: " + regNo });
    }

    res.status(200).json({ success: true, payments: student.payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrentFee = async (req, res) => {
  try {
    // Get the first fee record, or create one if it doesn't exist
    let fee = await Fee.findOne();
    if (!fee) {
      fee = await Fee.create({ amount: 45500 });
    }
    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fee" });
  }
};

const updateFee = async (req, res) => {
  const { amount, secret } = req.body;

  // Basic security check (You should set ADMIN_SECRET in your .env file)
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'futo-admin-secret';

  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ message: "Unauthorized: Invalid Secret Key" });
  }

  try {
    // Update the first fee record found, or create if empty
    const fee = await Fee.findOneAndUpdate({}, { amount: amount }, { new: true, upsert: true });
    res.status(200).json({ message: "Fee updated successfully", amount: fee.amount });
  } catch (error) {
    res.status(500).json({ message: "Failed to update fee", error: error.message });
  }
};

module.exports = { markAsPaid, getCurrentFee, updateFee };
