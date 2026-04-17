const pgSchema = require("../models/PgModel");

// ================= CREATE PG =================
const createPg = async (req, res) => {
  try {
    const savedPg = await pgSchema.create({
      ...req.body,
      ownerId: req.user._id,
      status: "pending", // default
    });

    res.status(201).json({
      success: true,
      message: "PG inserted successfully",
      data: savedPg,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error while inserting PG",
      error: err.message,
    });
  }
};

// ================= COMMON GET PG (ALL ROLES) =================
const getPGs = async (req, res) => {
  try {
    const user = req.user;
    let pgs = [];

    // 🧑‍💼 OWNER → only their PGs
    if (user.role === "owner") {
      pgs = await pgSchema
        .find({ ownerId: user._id })
        .populate("ownerId", "fullName email");
    }

    // 👤 TENANT → only approved PGs
    else if (user.role === "tenant") {
      pgs = await pgSchema
        .find({ status: "approved" })
        .populate("ownerId", "fullName email");
    }

    // 🧑‍💻 ADMIN → all PGs
    else if (user.role === "admin") {
      pgs = await pgSchema
        .find()
        .populate("ownerId", "fullName email");
    }

    else {
      return res.status(403).json({
        success: false,
        message: "Invalid role",
      });
    }

    res.status(200).json({
      success: true,
      message: "PGs fetched successfully",
      data: pgs,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching PGs",
      error: err.message,
    });
  }
};

// ================= UPDATE PG =================
const updatePg = async (req, res) => {
  try {
    const pg = await pgSchema.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: "PG not found",
      });
    }

    // Only owner can update
    if (String(pg.ownerId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not your PG",
      });
    }

    const updated = await pgSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "PG updated successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating PG",
      error: err.message,
    });
  }
};

// ================= DELETE PG =================
const deletePg = async (req, res) => {
  try {
    const pg = await pgSchema.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: "PG not found",
      });
    }

    if (String(pg.ownerId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not your PG",
      });
    }

    await pgSchema.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "PG deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting PG",
      error: err.message,
    });
  }
};

// ================= ADMIN APPROVE =================
const approvePg = async (req, res) => {
  try {
    // 🔒 Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can approve PG",
      });
    }

    const updated = await pgSchema.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "PG not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "PG approved successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error approving PG",
      error: err.message,
    });
  }
};

// ================= ADMIN REJECT =================
const rejectPg = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can reject PG",
      });
    }

    const updated = await pgSchema.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "PG not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "PG rejected successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error rejecting PG",
      error: err.message,
    });
  }
};

module.exports = {
  createPg,
  getPGs,
  updatePg,
  deletePg,
  approvePg,
  rejectPg,
};