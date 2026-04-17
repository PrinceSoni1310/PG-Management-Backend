const router = require("express").Router()

const foodController = require("../controllers/FoodController")
const upload = require("../middleware/UploadMiddleware")

// New enhanced endpoints
router.post("/create", upload.single("image"), foodController.createFoodMenu)
router.get("/", foodController.getFoodMenus)
router.put("/:id", upload.single("image"), foodController.updateFoodMenu)
router.delete("/:id", foodController.deleteFoodMenu)

// Legacy endpoints for backward compatibility
router.post("/addFood", foodController.manageFood)
router.get("/foodMenu", foodController.getAllFoodDetails)
router.put("/foodmenu/:id", foodController.updateFoodMenu)
router.post("/food", upload.single("image"), foodController.manageFood)

module.exports = router