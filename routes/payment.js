const express = require("express");
const { addPayment } = require("../controllers/payment.controller");
const { requireAuth } = require("../middleware/requireAuth");
const router = express.Router();

router.post("/addPayment", requireAuth, addPayment);

module.exports = router;
