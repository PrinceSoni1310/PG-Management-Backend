const router =  require("express").Router()

const reviewController = require("../controllers/ReviewController")

router.post("/addReview",reviewController.manageReview)
router.get("/reviews",reviewController.getAllReview)
router.put("/review/:id",reviewController.updateReviewDetails)
router.delete("/review/:id",reviewController.deleteReviewDetails)

module.exports = router