const complaintSchema = require("../models/ComplaintModel")
const userSchema = require("../models/UserModel")
const pgSchema = require("../models/PgModel")

const createComplaint = async (req, res) => {
  try {
    const tenant = req.user
    if (!tenant) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { pgId, category, description } = req.body

    if (!pgId || !category || !description) {
      return res.status(400).json({ message: "pgId, category, and description are required" })
    }

    // Get PG to find owner
    const pg = await pgSchema.findById(pgId)
    if (!pg) {
      return res.status(404).json({ message: "PG not found" })
    }

    const complaint = await complaintSchema.create({
      tenantId: tenant._id || tenant.id,
      pgId,
      ownerId: pg.ownerId,
      category,
      description,
      status: "pending"
    })

    await complaint.populate("tenantId", "fullName email")
    await complaint.populate("pgId", "pgName")

    res.status(201).json({
      message: "Complaint registered successfully",
      data: complaint
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Error while creating complaint",
      err: err
    })
  }
}

const getTenantComplaints = async (req, res) => {
  try {
    const tenant = req.user
    if (!tenant) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const tenantId = tenant._id || tenant.id
    const complaints = await complaintSchema
      .find({ tenantId })
      .populate("pgId", "pgName city")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Tenant complaints fetched",
      data: complaints
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Error while fetching complaints",
      err: err
    })
  }
}

const getOwnerComplaints = async (req, res) => {
  try {
    const owner = req.user
    if (!owner) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const ownerId = owner._id || owner.id
    const { pgId } = req.query

    let filter = { ownerId }
    if (pgId) {
      filter.pgId = pgId
    }

    const complaints = await complaintSchema
      .find(filter)
      .populate("tenantId", "fullName email roomId")
      .populate("pgId", "pgName")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Owner complaints fetched",
      data: complaints
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Error while fetching complaints",
      err: err
    })
  }
}

const updateComplaintStatus = async (req, res) => {
  try {
    const owner = req.user
    if (!owner) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { complaintId } = req.params
    const { status } = req.body

    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const complaint = await complaintSchema.findById(complaintId)
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" })
    }

    // Verify owner owns this complaint's PG
    const ownerId = owner._id || owner.id
    if (String(complaint.ownerId) !== String(ownerId)) {
      return res.status(403).json({ message: "Forbidden - You cannot update this complaint" })
    }

    complaint.status = status
    await complaint.save()
    await complaint.populate("tenantId", "fullName email")
    await complaint.populate("pgId", "pgName")

    res.status(200).json({
      message: "Complaint status updated",
      data: complaint
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Error while updating complaint",
      err: err
    })
  }
}

const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params

    const deleteComplaint = await complaintSchema.findByIdAndDelete(complaintId)
    res.status(200).json({
      message: "Complaint deleted successfully",
      data: deleteComplaint
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Error while deleting complaint",
      err: err
    })
  }
}

module.exports = {
  createComplaint,
  getTenantComplaints,
  getOwnerComplaints,
  updateComplaintStatus,
  deleteComplaint
}