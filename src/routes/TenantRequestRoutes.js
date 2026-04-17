const router = require("express").Router()
const validateToken = require("../middleware/AuthMiddleware")
const tenantRequestController = require("../controllers/TenantRequestController")

router.post("/", validateToken, tenantRequestController.createTenantRequest)
router.get("/tenant", validateToken, tenantRequestController.getTenantRequests)
router.get("/owner", validateToken, tenantRequestController.getOwnerRequests)
router.put("/:requestId", validateToken, tenantRequestController.updateTenantRequestStatus)

module.exports = router