const express = require("express");
const { addRoom, roomDetails } = require("../controllers/room.controller");
const { requireAuth } = require("../middleware/requireAuth");
const router = express.Router();

router.post("/addroom/:propId", requireAuth, addRoom);

router.get("/details/:roomId", requireAuth, roomDetails);

module.exports = router;
