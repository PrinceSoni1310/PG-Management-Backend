const router = require("express").Router()

const noticeController = require ("../controllers/NoticeController")

router.post("/",noticeController.manageNotice)
router.get("/",noticeController.getAllNotice)
router.put("/:id",noticeController.updateNoticeDetails)
router.delete("/:id",noticeController.deleteNoticeDetails)

module.exports = router