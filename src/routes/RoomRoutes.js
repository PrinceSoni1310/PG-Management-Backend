const router = require("express").Router()

const roomController = require("../controllers/RoomController")

router.post("/room",roomController.manageRooms)
router.get("/rooms",roomController.getRooms)
router.put("room/:id",roomController.updateRooms)
router.delete("/room/:id",roomController.deleteRooms)

module.exports = router