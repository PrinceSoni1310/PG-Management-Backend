const router = require("express").Router();
const controller = require("../controllers/PaymentController");
const auth = require("../middleware/AuthMiddleware");

router.post("/order", auth, controller.createRazorpayOrder);
router.post("/verify", auth, controller.verifyPayment);

router.post("/confirm-upi", auth, controller.confirmUpiPayment);
router.post("/cash", auth, controller.confirmCashPayment);

router.get("/", auth, controller.getAllPayments);
router.get("/my", auth, controller.getTenantPayments);
router.get("/owner", auth, controller.getOwnerPayments);

module.exports = router;