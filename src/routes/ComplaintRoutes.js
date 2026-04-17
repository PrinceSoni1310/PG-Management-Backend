const router = require("express").Router()
const validateToken = require("../middleware/AuthMiddleware")
const complaintController = require("../controllers/ComplaintController")

// Tenant routes
router.post("/", validateToken, complaintController.createComplaint)
router.get("/tenant", validateToken, complaintController.getTenantComplaints)

// Owner routes
router.get("/owner", validateToken, complaintController.getOwnerComplaints)
router.put("/:complaintId", validateToken, complaintController.updateComplaintStatus)

// Delete
router.delete("/:complaintId", validateToken, complaintController.deleteComplaint)

module.exports = router