const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  headPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
  },
  Persons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
    },
  ],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  Rent: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer.",
    },
  },
  initialReading: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer.",
    },
  },
  finalReading: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer.",
    },
  },
  PendingMoney: {
    type: Number,
    required: true,
    default: 0,
  },
  AdvanceMoney: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
