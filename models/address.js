const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    pincode: {
      type: String,
      required: true, // Postal code for the delivery address
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v); // Indian postal code validation
        },
        message: (props) => `${props.value} is not a valid postal code!`,
      },
    },
    locality: {
      type: String,
      required: true, // Locality or neighborhood
    },
    address: {
      type: String,
      required: true, // Full address (area and street)
    },
    city: {
      type: String,
      required: true, // City name
    },
    state: {
      type: String,
      required: true, // State name
    },
    landmark: {
      type: String,
      required: false, // Landmark near the address (optional)
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
