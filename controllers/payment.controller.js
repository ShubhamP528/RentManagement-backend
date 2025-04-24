const Payment = require("../models/Payment");
const Room = require("../models/room");
const Tenant = require("../models/Tenant");
const { getCompletedMonths, sendPaymentEmail } = require("../utils/utils");

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
    const tenantExists = await Tenant.findById(tenant).populate("headPerson");

    if (!roomExists || !tenantExists) {
      return res.status(404).json({ message: "Room or Tenant not found" });
    }

    const totalMonths = getCompletedMonths(tenantExists.startDate);

    console.log("Start Date:", tenantExists.startDate);

    console.log("Total Months:", totalMonths);

    const totalRent = tenantExists.Rent * totalMonths;

    const totalPayments = await Payment.find({ tenant: tenantExists._id });

    const totalPaidRent = totalPayments.reduce((acc, payment) => {
      return acc + payment.RoomRent;
    }, 0);

    const totalPayableRent = totalRent - totalPaidRent;
    const partialPendingMoney = totalPayableRent - RoomRent;

    if (partialPendingMoney > 0) {
      tenantExists.PendingMoney = partialPendingMoney;
      tenantExists.AdvanceMoney = 0;
    } else {
      tenantExists.AdvanceMoney = partialPendingMoney * -1;
      tenantExists.PendingMoney = 0;
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

    // ✅ Send confirmation email
    await sendPaymentEmail({
      to: tenantExists?.headPerson?.email,
      tenantName: tenantExists?.headPerson?.name,
      roomNumber: roomExists.number || roomExists.name || "Room", // customize based on schema
      DOP,
      MOP,
      RoomRent,
      Bill,
      totalAmount,
      previousReading,
      currentReading,
      finalReading: currentReading,
    });

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
