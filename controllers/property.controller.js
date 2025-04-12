const Property = require("../models/property");
const Address = require("../models/address");
const Room = require("../models/room");
const Owner = require("../models/Owner");
const { default: mongoose } = require("mongoose");

exports.addProperty = async (req, res) => {
  const name = req.body.propertyName;
  const address = req.body.address;
  const rooms = req.body.rooms;
  try {
    const newAddress = await Address.create(address);

    // Use map to create an array of promises and resolve them with Promise.all
    const roomPromises = rooms.map(async (room) => {
      const r = await Room.create({ name: room });
      return r._id;
    });

    console.log(roomPromises);

    const roomIds = await Promise.all(roomPromises);
    const newProperty = await Property.create({
      name: name,
      address: newAddress,
      rooms: roomIds,
    });

    req.user.properties.push(newProperty);

    await req.user.save(); // Save the updated user document with new properties

    res.status(201).json(newProperty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to check if a model is registered
function isModelRegistered(modelName) {
  return mongoose.models[modelName] !== undefined;
}

exports.getProperties = async (req, res) => {
  try {
    // Build the nested population options for rooms based on whether Tenant is registered
    const roomPopulate = isModelRegistered("Tenant")
      ? {
          path: "tenant",
          select:
            "headPerson Persons startDate endDate Rent initialReading PendingMoney",
          populate: {
            path: "headPerson",
            select: "name dob email gender address",
            populate: {
              path: "address",
              select: "pincode locality address city state landmark",
            },
          },
        }
      : null;

    // Build the population options for properties
    const populateProperties = {
      path: "properties",
      select: "name address rooms",
      populate: [
        {
          path: "address",
          select: "pincode locality address city state landmark",
        },
        // {
        //   path: "rooms",
        //   // select: "name tenant",
        //   // populate: roomPopulate ? roomPopulate : undefined,
        // },
      ].filter(Boolean),
    };

    const owner = await Owner.findById(req.user._id)
      .populate(populateProperties)
      .exec();

    res.json(owner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id);
    // First, find an Owner that has this property
    const prop = await Owner.findOne({ properties: { $in: [id] } }).exec();
    // console.log(prop);
    if (!prop) return res.status(404).json({ message: "Property not found" });

    // Build the rooms population options conditionally
    const roomsPopulate = {
      path: "rooms",
      select: "name tenant",
    };

    // Only populate "tenant" if the Tenant model is registered
    if (isModelRegistered("Tenant")) {
      roomsPopulate.populate = {
        path: "tenant",
        select: "startDate endDate",
        // populate: {
        //   path: "headPerson",
        //   select: "name dob email gender address",
        //   populate: {
        //     path: "address",
        //     select: "pincode locality address city state landmark",
        //   },
        // },
      };
    }

    // Populate the property with its address and rooms (with conditional tenant population)
    const property = await Property.findById(id)
      .populate({
        path: "address",
        select: "pincode locality address city state landmark",
      })
      .populate(roomsPopulate)
      .exec();

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.editProperty = async (req, res) => {
  try {
    const editType = res.body.editType;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
