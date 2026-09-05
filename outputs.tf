output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "ec2_instance_id" {
  value = aws_instance.app_server.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.app_bucket.bucket
}

output "iam_user_name" {
  value = aws_iam_user.app_user.name
}

output "iam_user_arn" {
  value = aws_iam_user.app_user.arn
}

output "iam_role_name" {
  value = aws_iam_role.ec2_s3_role.name
}

output "iam_instance_profile_name" {
  value = aws_iam_instance_profile.ec2_profile.name
}

output "vpc_id" {
  value = aws_vpc.app_vpc.id
}

output "subnet_id" {
  value = aws_subnet.app_subnet.id
}