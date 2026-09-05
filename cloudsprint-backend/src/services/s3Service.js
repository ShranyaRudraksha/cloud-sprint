// src/services/s3Service.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: "ap-south-1" });

async function getUploadUrl(bucketName, fileName, contentType) {
  const command = new PutObjectCommand({ Bucket: bucketName, Key: fileName, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: 300 }); // 5-minute link
}

module.exports = { getUploadUrl };