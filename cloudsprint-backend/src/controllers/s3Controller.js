// src/controllers/s3Controller.js
const { getUploadUrl } = require("../services/s3Service");

async function generateUploadUrl(req, res) {
  const { bucket_name, file_name, content_type } = req.body;
  try {
    const url = await getUploadUrl(bucket_name, file_name, content_type);
    res.json({ upload_url: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
}

module.exports = { generateUploadUrl };