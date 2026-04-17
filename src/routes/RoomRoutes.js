const router = require("express").Router()
const roomController = require("../controllers/RoomController")
const validateToken = require("../middleware/AuthMiddleware")

router.post("/", validateToken, roomController.manageRooms)
router.get("/", validateToken, roomController.getRooms)
router.put("/:id", validateToken, roomController.updateRooms)
router.delete("/:id", validateToken, roomController.deleteRooms)

module.exports = router
