const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  session: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  reference: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'successful',
  },
});

module.exports = mongoose.model('Payment', PaymentSchema);