const mongoose = require("mongoose")
const schema = mongoose.Schema

const tenantRequestSchema = new schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PG",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  message: {
    type: String,
  },
}, { timestamps: true })

module.exports = mongoose.model("TenantRequest", tenantRequestSchema)
