resource "aws_iam_user" "app_user" {
  name = var.iam_user_name

  tags = {
    Name    = "provisioning-platform-iam-user"
    Project = "CloudSprint"
  }
}

resource "aws_iam_user_policy_attachment" "app_user_policy" {
  user       = aws_iam_user.app_user.name
  policy_arn = var.iam_policy_arn
}

resource "aws_iam_role" "ec2_s3_role" {
  name = var.iam_role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

  tags = {
    Name    = "provisioning-platform-ec2-role"
    Project = "CloudSprint"
  }
}

resource "aws_iam_role_policy_attachment" "ec2_s3_role_policy" {
  role       = aws_iam_role.ec2_s3_role.name
  policy_arn = var.iam_policy_arn
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.iam_role_name}-profile"
  role = aws_iam_role.ec2_s3_role.name
}