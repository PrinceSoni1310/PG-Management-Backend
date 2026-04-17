const router = require("express").Router()

const userController = require("../controllers/UserController")
const validateToken = require("../middleware/AuthMiddleware")

router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)

// Get all users
router.get("/users", userController.getUser)

// Get single user by ID ✅ (NEW FIX)
router.get("/:id", validateToken, userController.getUserById)

// Update & delete
router.put("/user/:id", userController.updateUser)
router.delete("/user/:id", userController.deleteUser)

// Other routes
router.post("/forgotpassword", userController.forgotPassword)
router.put("/resetpassword", userController.resetPassword)

module.exports = router