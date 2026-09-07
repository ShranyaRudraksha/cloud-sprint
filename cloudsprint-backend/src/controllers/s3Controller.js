// src/controllers/s3Controller.js
const pool = require("../config/db");
const { getUploadUrl } = require("../services/s3Service");

async function generateUploadUrl(req, res) {
  const { bucket_name, file_name, content_type } = req.body;
  if (!bucket_name || !file_name) {
    return res.status(400).json({ error: "bucket_name and file_name are required" });
  }

  try {
    const owns = await pool.query(
      `SELECT 1 FROM requests r
       JOIN inventory i ON i.request_id = r.id
       WHERE r.user_id = $1 AND r.resource_type = 's3' AND i.status = 'active' AND i.resource_id = $2`,
      [req.user.id, bucket_name]
    );
    if (owns.rows.length === 0) {
      return res.status(403).json({ error: "You don't have an active S3 bucket with that name" });
    }

    const url = await getUploadUrl(bucket_name, file_name, content_type);
    res.json({ upload_url: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
}

module.exports = { generateUploadUrl };
