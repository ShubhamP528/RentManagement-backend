const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  DOP: {
    // Date of Payment
    type: Date,
    required: true,
  },

  MOP: {
    // Month of payment
    type: String,
    required: true,
  },

  RoomRent: {
    type: Number,
    required: true,
  },
  currentReading: {
    type: Number,
    required: true,
  },
  previousReading: {
    type: Number,
    required: true,
  },
  BuildReading: {
    type: Number,
    required: true,
  },
  Bill: {
    type: Number,
    required: true,
  },
  totalAmount: {
    // RoomRent + Bill
    type: Number,
    required: true,
  },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
