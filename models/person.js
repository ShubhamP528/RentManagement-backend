const mongoose = require("mongoose");

const personShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return new Date() - value > 315576000000; // 1 year in milliseconds
      },
      message: "Date of birth must be before the current date.",
    },
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
  isHead: {
    type: Boolean,
    default: false,
    required: true,
  },
  relation: {
    relationWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
    },
    relationType: {
      type: String,
      required: true,
      // enum: ["parent", "child", "sibling", "spouse"],
    },
  },
});

const Person = mongoose.model("Person", personShema);

module.exports = Person;
