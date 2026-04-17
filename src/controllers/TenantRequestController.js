const TenantRequest = require("../models/TenantRequestModel")
const PG = require("../models/PgModel")
const userSchema = require("../models/UserModel")

const createTenantRequest = async (req, res) => {
  try {
    const tenant = req.user
    console.log("createTenantRequest - tenant object:", {
      id: tenant?._id || tenant?.id,
      email: tenant?.email,
      role: tenant?.role
    })

    if (!tenant) {
      return res.status(401).json({ message: "Unauthorized - No user found" })
    }

    const userRole = String(tenant.role || '').toLowerCase();
    if (!userRole) {
      return res.status(403).json({ 
        message: "User role not set. Please update your profile.",
        userRole: tenant.role
      })
    }

    if (userRole !== "tenant") {
      return res.status(403).json({ 
        message: "Only tenants can create requests",
        userRole: tenant.role
      })
    }

    const { pgId, message } = req.body
    if (!pgId) {
      return res.status(400).json({ message: "pgId is required" })
    }

    if (tenant.pgId) {
      return res.status(400).json({ message: "Tenant already assigned to a PG" })
    }

    const pg = await PG.findById(pgId)
    if (!pg) {
      return res.status(404).json({ message: "PG not found" })
    }

    if (!pg.ownerId) {
      return res.status(400).json({ message: "PG does not have an owner assigned" })
    }

    const existing = await TenantRequest.findOne({ tenantId: tenant.id || tenant._id, pgId, status: "pending" })
    if (existing) {
      return res.status(400).json({ message: "Request already pending" })
    }

    const request = await TenantRequest.create({
      tenantId: tenant.id || tenant._id,
      pgId,
      ownerId: pg.ownerId,
      status: "pending",
      message: message || "Request to join PG"
    })

    return res.status(201).json({ message: "Request submitted", data: request })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error creating tenant request", err })
  }
}

const getTenantRequests = async (req, res) => {
  try {
    const tenant = req.user
    if (!tenant) return res.status(401).json({ message: "Unauthorized" })

    const filter = { tenantId: tenant.id || tenant._id }
    if (req.query.status) {
      filter.status = req.query.status
    }

    const requests = await TenantRequest.find(filter).populate("pgId", "pgName city state").populate("ownerId", "fullName email")
    return res.status(200).json({ message: "Tenant requests fetched", data: requests })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error fetching tenant requests", err })
  }
}

const getOwnerRequests = async (req, res) => {
  try {
    const owner = req.user
    const ownerRole = String(owner?.role || '').toLowerCase()
    if (!owner || ownerRole !== "owner") {
      return res.status(403).json({ message: "Only owners can view requests" })
    }

    const filter = { ownerId: owner.id || owner._id }
    if (req.query.status) {
      filter.status = req.query.status
    }

    const requests = await TenantRequest.find(filter)
      .populate("tenantId", "fullName email")
      .populate("pgId", "pgName city state")

    return res.status(200).json({ message: "Owner requests fetched", data: requests })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error fetching owner requests", err })
  }
}

const updateTenantRequestStatus = async (req, res) => {
  try {
    const owner = req.user
    console.log("updateTenantRequestStatus - owner:", {
      id: owner?.id,
      _id: owner?._id,
      role: owner?.role
    })

    const ownerRole = String(owner?.role || '').toLowerCase()
    if (!owner || ownerRole !== "owner") {
      return res.status(403).json({ message: "Only owners can change request status" })
    }

    const { requestId } = req.params
    const { status, message } = req.body

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const reqDoc = await TenantRequest.findById(requestId)
    if (!reqDoc) return res.status(404).json({ message: "Request not found" })

    const ownerId = owner.id || owner._id
    console.log("Comparing ownerId:", {
      reqDocOwnerId: String(reqDoc.ownerId),
      ownerIdFromToken: String(ownerId)
    })

    if (String(reqDoc.ownerId) !== String(ownerId)) {
      return res.status(403).json({ message: "Forbidden - This request does not belong to you" })
    }

    reqDoc.status = status
    reqDoc.message = message || ""
    await reqDoc.save()

    if (status === "approved") {
      await userSchema.findByIdAndUpdate(reqDoc.tenantId, { pgId: reqDoc.pgId })
    }

    return res.status(200).json({ message: `Request ${status}`, data: reqDoc })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error updating request status", err })
  }
}

module.exports = {
  createTenantRequest,
  getTenantRequests,
  getOwnerRequests,
  updateTenantRequestStatus,
}
