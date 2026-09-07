resource "aws_s3_bucket" "app_bucket" {
  bucket = var.bucket_name

  # Users can upload objects to their bucket via the app, and versioning is
  # enabled below — without this, a bucket with any object (even a deleted
  # one, which leaves a delete-marker "version" behind) fails to destroy
  # with BucketNotEmpty. This tells Terraform to empty it first.
  force_destroy = true

  tags = {
    Name    = "${var.resource_name}-bucket"
    Project = "CloudSprint"
  }
}

resource "aws_s3_bucket_versioning" "app_bucket_versioning" {
  bucket = aws_s3_bucket.app_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "app_bucket_block" {
  bucket = aws_s3_bucket.app_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# The app's browser-based upload widget PUTs directly to S3 using a presigned
# URL. Without CORS allowed, the browser blocks that cross-origin request
# before it reaches S3 at all (curl/server-to-server calls aren't affected,
# only real browsers enforce CORS) — surfaces as a generic "Failed to fetch".
resource "aws_s3_bucket_cors_configuration" "app_bucket_cors" {
  bucket = aws_s3_bucket.app_bucket.id

  cors_rule {
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = ["*"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}