const express = require("express");
const {
  addProperty,
  getProperties,
  getProperty,
  editProperty,
} = require("../controllers/property.controller");
const { requireAuth } = require("../middleware/requireAuth");
const router = express.Router();

router.post("/add-property", requireAuth, addProperty);

router.get("/get-properties", requireAuth, getProperties);

router.get("/get-property/:id", requireAuth, getProperty);

// router.post("/edit-Property", editProperty);

module.exports = router;
