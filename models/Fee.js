const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  level: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  session: { type: String, default: "2025/2026" }
});

module.exports = mongoose.model('Fee', FeeSchema);