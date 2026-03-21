const router = require("express").Router()

const pgController = require("../controllers/PgController")

router.post("/createPg",pgController.createPg)
router.get("/pgDetails",pgController.getPgDetails)
router.put("/pgDetail/:id",pgController.updatePg)
router.delete("/pgDetail/:id",pgController.deletePg)

module.exports = router