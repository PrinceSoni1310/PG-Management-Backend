const router = require("express").Router()

const userController = require("../controllers/UserController")
const validateToken = require("../middleware/AuthMiddleware")

router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)

// Add tenant by owner (with auth)
router.post("/add-tenant", validateToken, userController.addTenantByOwner)

// Get all users
router.get("/users", userController.getUser)

// Get single user by ID ✅ (NEW FIX)
router.get("/:id", validateToken, userController.getUserById)

// Update & delete
router.put("/user/:id", validateToken, userController.updateUser)
router.delete("/user/:id", validateToken, userController.deleteUser)

// Password change for logged-in users
router.put("/changepassword", validateToken, userController.changePassword)

// Other routes
router.post("/forgotpassword", userController.forgotPassword)
router.put("/resetpassword", userController.resetPassword)

module.exports = router