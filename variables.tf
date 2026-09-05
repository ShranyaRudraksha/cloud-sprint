variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance (Amazon Linux 2023)"
  type        = string
}

variable "key_name" {
  description = "Name of an existing EC2 key pair for SSH access"
  type        = string
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name"
  type        = string
}

variable "iam_user_name" {
  description = "Name for the scoped IAM user"
  type        = string
  default     = "cloudsprint-app-user"
}

variable "iam_policy_arn" {
  description = "Managed policy ARN to attach to the IAM user (scope this down later)"
  type        = string
  default     = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

variable "iam_role_name" {
  description = "Name for the IAM role assumable by EC2"
  type        = string
  default     = "cloudsprint-ec2-role"
}
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for the subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "AZ for the subnet"
  type        = string
  default     = "ap-south-1a"
}