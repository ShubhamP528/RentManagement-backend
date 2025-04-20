const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // unique: true,
  },
  tenant: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  ],
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
