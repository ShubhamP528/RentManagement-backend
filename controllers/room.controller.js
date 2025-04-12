const Property = require("../models/property");
const Room = require("../models/room");

exports.addRoom = async (req, res) => {
  try {
    const propId = req.params.propId;
    const roomName = req.body.roomName;
    const newRoom = new Room({ name: roomName });
    const property = await Property.findById(propId);
    property.rooms.push(newRoom);
    await newRoom.save();

    await property.save();
    console.log("Room added successfully");
    return res.status(201).json({ room: newRoom });
  } catch (error) {
    console.error(error);
    throw new Error("Error adding room");
  }
};

exports.roomDetails = async (req, res) => {
  try {
    // Get room details by id
    const roomId = req.params.roomId;
    console.log(roomId);

    roomsPopulate = {
      path: "tenant",
      select:
        "headPerson Persons startDate endDate Rent initialReading finalReading PendingMoney AdvanceMoney",
      populate: [
        {
          path: "headPerson",
          select: "name dob email gender address",
          populate: {
            path: "address",
            select: "pincode locality address city state landmark",
          },
        },
        {
          path: "Persons",
          select: "name dob email gender address isHead relation",
          populate: {
            path: "address",
            select: "pincode locality address city state landmark",
          },
        },
      ],
    };

    const roomData = await Room.findById(roomId).populate(roomsPopulate).exec();
    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }
    return res.json(roomData);
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: error.message });
  }
};
