const Payment = require("../models/Payment");
const Room = require("../models/room");
const Tenant = require("../models/Tenant");

// Controller to add a new payment
exports.addPayment = async (req, res) => {
  try {
    // Destructure data from the request body
    const {
      room,
      tenant,
      DOP,
      MOP,
      RoomRent,
      currentReading,
      previousReading,
      BuildReading,
      Bill,
      status,
    } = req.body;

    // Validate if room and tenant exist
    const roomExists = await Room.findById(room);
    const tenantExists = await Tenant.findById(tenant);

    if (!roomExists || !tenantExists) {
      return res.status(404).json({ message: "Room or Tenant not found" });
    }
    const partialPendingMoney = RoomRent - tenantExists.Rent;

    if (tenantExists.PendingMoney > 0 && tenantExists.AdvanceMoney === 0) {
      if (partialPendingMoney > 0) {
        tenantExists.PendingMoney =
          tenantExists.PendingMoney - partialPendingMoney;
      } else if (partialPendingMoney < 0) {
        tenantExists.PendingMoney =
          partialPendingMoney * -1 + tenantExists.PendingMoney;
      }
    } else if (
      tenantExists.AdvanceMoney > 0 &&
      tenantExists.PendingMoney === 0
    ) {
      if (partialPendingMoney > 0) {
        tenantExists.AdvanceMoney =
          tenantExists.AdvanceMoney + partialPendingMoney;
      }
      if (partialPendingMoney < 0) {
        tenantExists.AdvanceMoney =
          tenantExists.AdvanceMoney - partialPendingMoney * -1;
      }
    } else if (
      tenantExists.AdvanceMoney === 0 &&
      tenantExists.PendingMoney === 0
    ) {
      if (partialPendingMoney > 0) {
        tenantExists.AdvanceMoney =
          tenantExists.AdvanceMoney + partialPendingMoney;
      }
      if (partialPendingMoney < 0) {
        tenantExists.PendingMoney =
          tenantExists.PendingMoney + partialPendingMoney * -1;
      }
    }

    // Calculate the total amount (RoomRent + Bill)
    const totalAmount = RoomRent + Bill;

    // Create a new payment record
    const newPayment = new Payment({
      room,
      tenant,
      DOP,
      MOP,
      RoomRent,
      currentReading,
      previousReading,
      BuildReading,
      Bill,
      totalAmount,
      status,
    });

    tenantExists.finalReading = currentReading;

    // Save the payment record to the database
    await newPayment.save();

    await tenantExists.save();

    // Respond with the saved payment
    res.status(201).json({
      message: "Payment added successfully",
      payment: newPayment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
