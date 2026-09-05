const express = require("express");
const router = express.Router();
const { createRequest, getRequests, decideRequest, teardownRequest, getMyResources, getRequestLogs, getOrgAdmins } = require("../controllers/requestController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
router.post("/", requireAuth, createRequest);
router.get("/", requireAuth, getRequests);
router.patch("/:id/decision", requireAuth, requireAdmin, decideRequest);
router.post("/:id/teardown", requireAuth, teardownRequest);
router.get("/:id/logs", requireAuth, getRequestLogs);

router.get("/my-resources", requireAuth, getMyResources);
router.get("/org-admins", requireAuth, getOrgAdmins);

module.exports = router;

