const Student = require('../models/Student');

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

module.exports = { markAsPaid };