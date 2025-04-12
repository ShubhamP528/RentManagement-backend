const express = require("express");
const {
  addTenantToRoom,
  removeTenantToRoom,
  getTransaction,
} = require("../controllers/tenant.controller");
const { requireAuth } = require("../middleware/requireAuth");
const router = express.Router();

router.post("/addTenant/:roomId", requireAuth, addTenantToRoom);

// Remove tenant from room
router.post("/removeTenant/:roomId", requireAuth, removeTenantToRoom);

router.get("/getTransaction/:tenantId", requireAuth, getTransaction);

module.exports = router;
