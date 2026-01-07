const Student = require('../models/Student');

const markAsPaid = async (req, res) => {
  const { regNo, level, amountPaid, reference } = req.body;

  try {
    // 1. Find student by Registration Number
    const student = await Student.findOne({ regNo });
    
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    // 2. Check for duplicate reference (Idempotency)
    // This prevents adding the same payment twice if the frontend retries
    const isDuplicate = student.payments && student.payments.some(p => p.reference === reference);
    if (isDuplicate) {
      return res.status(200).json({ success: true, message: "Payment already recorded", payments: student.payments });
    }

    // 3. Add payment to the array
    const newPayment = {
      level, 
      amount: amountPaid,
      reference,
      date: new Date()
    };

    student.payments.push(newPayment);

    // 4. Save to database
    await student.save();
    
    res.status(200).json({ success: true, payments: student.payments });
  } catch (error) {
    console.error("DB Save Error:", error);
    res.status(500).json({ error: "Server failed to save payment" });
  }
};

module.exports = { markAsPaid };