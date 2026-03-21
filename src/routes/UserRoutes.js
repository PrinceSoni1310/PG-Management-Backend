const router = require("express").Router()

const userController = require("../controllers/UserController")
const validateToken = require("../middleware/AuthMiddleware")

router.post("/register",userController.registerUser)
router.post("/login",userController.loginUser)
router.get("/users",userController.getUser)
router.put("/user/:id",userController.updateUser)
router.delete("/user/:id",userController.deleteUser)
router.get("/user", validateToken,userController.getUser)

module.exports = router