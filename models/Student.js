const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  regNo: {
    type: String,
    required: function() { return !this.googleId; },
    unique: true,
    sparse: true
  },
  department: {
    type: String,
    required: function() { return !this.googleId; }
  },
  faculty: {
    type: String,
    required: function() { return !this.googleId; }
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  isActivated: {
    type: Boolean,
    default: false
  },
  activationCode: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);