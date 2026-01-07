const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  level: { type: String, required: true },
  amount: { type: Number, required: true },
  reference: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Successful' }
});

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  regNo: {
    type: String,
    default: "NOT_SET"
  },
  department: {
    type: String
  },
  faculty: {
    type: String
  },
  payments: [paymentSchema],
  googleId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);