const mongoose = require("mongoose");
const schema = mongoose.Schema;

const paymentSchema = new schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
    },
    year: {
      type: Number,
    },
    paymentType: {
      type: String,
      enum: ["rent", "deposit"],
      default: "rent",
    },
    dueDate: {
      type: Date,
    },
    paymentDate: {
      type: Date,
    },
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "cash"],
      default: "card",
    },

    upiId: String,
    undoUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ FIXED UNIQUE INDEX
paymentSchema.index(
  { tenantId: 1, month: 1, year: 1, paymentType: 1 },
  { unique: true }
);

module.exports = mongoose.model("Payment", paymentSchema);