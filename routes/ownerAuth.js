const express = require("express");
const {
  login,
  signup,
  verifyUser,
} = require("../controllers/ownerAuth.controller");
const { requireAuth } = require("../middleware/requireAuth");
const route = express.Router();

route.post("/login", login);

route.post("/signup", signup);

route.get("/verify", requireAuth, verifyUser);

module.exports = route;
