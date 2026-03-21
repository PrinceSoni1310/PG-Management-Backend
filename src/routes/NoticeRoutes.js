const router = require("express").Router()

const noticeController = require ("../controllers/NoticeController")

router.post("/addNotice",noticeController.manageNotice)
router.get("/notice",noticeController.getAllNotice)
router.put("/notice/:id",noticeController.updateNoticeDetails)
router.delete("/notice/:id",noticeController.deleteNoticeDetails)

module.exports = router