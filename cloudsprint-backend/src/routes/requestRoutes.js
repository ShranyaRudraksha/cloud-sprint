const express = require("express");
const router = express.Router();
const { createRequest, getRequests, decideRequest, teardownRequest, getMyResources } = require("../controllers/requestController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
router.post("/", requireAuth, createRequest);
router.get("/", requireAuth, getRequests);
router.patch("/:id/decision", requireAuth, requireAdmin, decideRequest);
router.post("/:id/teardown", requireAuth, teardownRequest);

router.get("/my-resources", requireAuth, getMyResources);

module.exports = router;

