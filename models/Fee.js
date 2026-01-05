const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fee', FeeSchema);