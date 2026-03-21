const router = require("express").Router()
const paymentController = require("../controllers/PaymentController")

router.post("/payment",paymentController.managePayment)
router.get("/payments" ,paymentController.getPayments)
router.put("/payment/:id",paymentController.updatePaymentDetails)
router.delete("/payment/:id",paymentController.deletePaymentDetails)

module.exports = router