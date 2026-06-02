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
      status: "pending",
      paymentMethod: "cash",
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markCashPaymentPaid = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findOneAndUpdate(
      { _id: paymentId, ownerId: req.user._id, paymentMethod: 'cash', status: 'pending' },
      { status: 'success', paymentDate: new Date() },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found or cannot be updated' });
    }

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

// ================= MOCK PAYMENT (DEMO ONLY) =================
const confirmMockPayment = async (req, res) => {
  try {
    const { amount, pgId, paymentMethod } = req.body;
    const tenantId = req.user._id;

    const pg = await PG.findById(pgId);

    const payment = await Payment.create({
      tenantId,
      pgId,
      ownerId: pg?.ownerId,
      amount,
      month: new Date().toLocaleString("default", { month: "long" }),
      year: new Date().getFullYear(),
      status: "success",
      paymentMethod: paymentMethod || "card",
      paymentDate: new Date(),
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  confirmUpiPayment,
  confirmCashPayment,
  getTenantPayments,
  getOwnerPayments,
  getAllPayments,
  confirmMockPayment,
  markCashPaymentPaid,
  // owner confirms cash payment (create paid record)
  ownerConfirmCashPayment: async (req, res) => {
    try {
      const { tenantId, pgId, amount, month, year } = req.body;
      const ownerId = req.user._id;

      if (!tenantId || !pgId) return res.status(400).json({ message: 'tenantId and pgId required' });

      const pg = await PG.findById(pgId);
      if (!pg) return res.status(404).json({ message: 'PG not found' });
      if (String(pg.ownerId) !== String(ownerId)) return res.status(403).json({ message: 'Not authorized' });

      const payment = await Payment.create({
        tenantId,
        pgId,
        ownerId,
        amount,
        month: month || new Date().toLocaleString('default', { month: 'long' }),
        year: year || new Date().getFullYear(),
        status: 'success',
        paymentMethod: 'cash',
        paymentDate: new Date(),
      });

      res.status(200).json({ success: true, data: payment });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  unmarkCashPayment: async (req, res) => {
    try {
      const paymentId = req.params.id;
      const payment = await Payment.findOneAndUpdate(
        { _id: paymentId, ownerId: req.user._id, paymentMethod: 'cash', status: 'success', undoUsed: { $ne: true } },
        { status: 'pending', paymentDate: null, undoUsed: true },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found or undo not available' });
      }

      res.status(200).json({ success: true, data: payment });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};