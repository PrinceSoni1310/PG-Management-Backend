const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/PaymentModel");
const PG = require("../models/PgModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= CREATE ORDER =================
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, month, year, pgId } = req.body;
    const tenantId = req.user._id;

    if (!pgId) {
      return res.status(400).json({ message: "pgId required" });
    }

    const pg = await PG.findById(pgId);
    if (!pg) {
      return res.status(400).json({ message: "PG not found" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `pg-${tenantId}-${Date.now()}`,
    });

    await Payment.create({
      tenantId,
      pgId,
      ownerId: pg.ownerId,
      amount,
      month,
      year,
      paymentType: "rent",
      status: "pending",
      razorpay_order_id: order.id,
      paymentMethod: "card",
    });

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= VERIFY PAYMENT =================
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ message: "Verification failed" });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: "success",
        paymentDate: new Date(),
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPI =================
const confirmUpiPayment = async (req, res) => {
  try {
    const { amount, pgId } = req.body;
    const tenantId = req.user._id;

    const pg = await PG.findById(pgId);

    const payment = await Payment.create({
      tenantId,
      pgId,
      ownerId: pg.ownerId,
      amount,
      month: new Date().toLocaleString("default", { month: "long" }),
      year: new Date().getFullYear(),
      status: "success",
      paymentMethod: "upi",
      paymentDate: new Date(),
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CASH =================
const confirmCashPayment = async (req, res) => {
  try {
    const { amount, pgId } = req.body;
    const tenantId = req.user._id;

    const pg = await PG.findById(pgId);

    const payment = await Payment.create({
      tenantId,
      pgId,
      ownerId: pg.ownerId,
      amount,
      month: new Date().toLocaleString("default", { month: "long" }),
      year: new Date().getFullYear(),
      status: "success",
      paymentMethod: "cash",
      paymentDate: new Date(),
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= FETCH =================
const getTenantPayments = async (req, res) => {
  const payments = await Payment.find({ tenantId: req.user._id })
    .populate("tenantId", "fullName")
    .populate("pgId", "pgName");

  res.json({ data: payments });
};

const getOwnerPayments = async (req, res) => {
  const payments = await Payment.find({ ownerId: req.user._id })
    .populate("tenantId", "fullName")
    .populate("pgId", "pgName");

  res.json({ data: payments });
};

const getAllPayments = async (req, res) => {
  const payments = await Payment.find();
  res.json({ data: payments });
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  confirmUpiPayment,
  confirmCashPayment,
  getTenantPayments,
  getOwnerPayments,
  getAllPayments,
};