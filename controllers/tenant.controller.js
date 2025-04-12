const Payment = require("../models/Payment");
const Person = require("../models/person");
const Room = require("../models/room");
const Tenant = require("../models/Tenant");

exports.addTenantToRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { personsData, tenantData } = req.body;
    tenantData.finalReading = tenantData.initialReading;

    // Step 1: Find the headPerson from personsData (based on isHead attribute)
    const headPersonData = personsData.find((person) => person.isHead === true);

    if (!headPersonData) {
      return res
        .status(400)
        .json({ message: "No headPerson found in persons data" });
    }

    // Step 2: Create the headPerson and save it
    const headPerson = new Person(headPersonData);
    await headPerson.save();

    // Step 3: Update the other persons' relationWith to the headPerson's _id
    const otherPersonsData = personsData
      .filter((person) => person.isHead !== true) // Exclude the headPerson
      .map((personData) => {
        return {
          ...personData,
          relation: {
            relationWith: headPerson._id, // Set relationWith to headPerson's _id
            relationType: "spouse", // You can modify this depending on your requirements
          },
        };
      });

    // Step 4: Create the other persons and save them
    const otherPersons = [];
    for (let personData of otherPersonsData) {
      const newPerson = new Person(personData);
      await newPerson.save();
      otherPersons.push(newPerson._id); // Store each new person's ID
    }

    // Step 5: Create the new Tenant, including the headPerson and other persons
    const newTenantData = {
      ...tenantData,
      headPerson: headPerson._id, // Set the headPerson
      Persons: [headPerson._id, ...otherPersons], // Include all persons in the Tenant
    };

    const newTenant = new Tenant(newTenantData);
    await newTenant.save();

    // Step 6: Find the room by ID
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Step 7: Add the new tenant to the room
    room.tenant.push(newTenant._id);
    await room.save();

    // Optionally, populate the room's tenants with more details
    const populatedRoom = await newTenant.populate("Persons");

    // Return the response with the new tenant added to the room
    res.status(201).json({
      message: "Tenant and Persons added to room successfully",
      room: populatedRoom,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeTenantToRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { tenantId, endDate } = req.body;

    // Step 1: Find the room by roomId
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Step 2: Find the tenant by tenantId
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Step 3: Mark the tenant's endDate (if not provided, use current date)
    tenant.endDate = endDate || new Date();
    await tenant.save();

    // Step 4: Remove the tenant from the room's tenant array
    // room.tenant = room.tenant.filter((t) => t.toString() !== tenantId);
    await room.save();

    // Return a success response
    res
      .status(200)
      .json({ message: "Tenant removed from room successfully", room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const transaction = await Payment.find({ tenant: tenantId }).sort({
      DOP: -1,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res
      .status(200)
      .json({ message: "Transaction retrieved successfully", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
