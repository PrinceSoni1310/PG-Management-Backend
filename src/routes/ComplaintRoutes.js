const router = require("express").Router()

const complaintController = require("../controllers/ComplaintController")

router.post("/complaint",complaintController.manageComplaint)
router.get("/complaints" , complaintController.getAllComplaints)
router.put("/complaint/:id",complaintController.updateComplaintDetails)
router.delete("/compalaint/:id",complaintController.deleteComplaintDetails)

module.exports = router