const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/AuthMiddleware");

const {
  createPg,
  getPGs,
  updatePg,
  deletePg,
  approvePg,
  rejectPg
} = require("../controllers/PgController");

// ================= COMMON ROUTE =================
// 🔥 One API handles all roles (Admin, Owner, Tenant)
router.get("/", authMiddleware, getPGs);

// ================= OWNER =================
router.post("/", authMiddleware, createPg);
router.put("/:id", authMiddleware, updatePg);
router.delete("/:id", authMiddleware, deletePg);

// ================= ADMIN =================
router.put("/:id/approve", authMiddleware, approvePg);
router.put("/:id/reject", authMiddleware, rejectPg);

module.exports = router;