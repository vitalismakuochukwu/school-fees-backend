const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 45500
  }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);