const router = require("express").Router()

const foodController = require("../controllers/FoodController")
const upload = require("../middleware/UploadMiddleware")

router.post("/addFood",foodController.manageFood)
router.get("/foodMenu",foodController.getAllFoodDetails)
router.put("/foodmenu/:id",foodController.updateFoodMenu)
router.delete("/foodmenu/:id",foodController.deleteFoodMenu)
router.post("/food",upload.single("image"),foodController.manageFood)

module.exports = router