const router = require("express").Router();
const controller = require("../controllers/PaymentController");
const auth = require("../middleware/AuthMiddleware");

router.post("/order", auth, controller.createRazorpayOrder);
router.post("/verify", auth, controller.verifyPayment);

router.post("/confirm-upi", auth, controller.confirmUpiPayment);
router.post("/cash", auth, controller.confirmCashPayment);
router.post('/owner/cash', auth, controller.ownerConfirmCashPayment);
router.put("/:id/mark-paid", auth, controller.markCashPaymentPaid);
router.put("/:id/unmark-paid", auth, controller.unmarkCashPayment);

// Demo mock payment endpoint (no real gateway)
router.post("/mock", auth, controller.confirmMockPayment);

router.get("/", auth, controller.getAllPayments);
router.get("/my", auth, controller.getTenantPayments);
router.get("/owner", auth, controller.getOwnerPayments);

module.exports = router;