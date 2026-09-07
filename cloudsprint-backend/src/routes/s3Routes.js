const express = require("express");
const router = express.Router();
const { generateUploadUrl } = require("../controllers/s3Controller");
const { requireAuth } = require("../middleware/auth");

router.post("/upload-url", requireAuth, generateUploadUrl);

module.exports = router;
