const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  regNo: { type: String, unique: true, required: true },
  department: { type: String },
  faculty: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  
  // Auth & Verification Fields
  isActivated: { type: Boolean, default: false },
  activationCode: { type: String },
  googleId: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

  // Payment Records
  payments: [{
    level: String,      // e.g., "100L", "Year 1"
    amount: Number,
    reference: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
