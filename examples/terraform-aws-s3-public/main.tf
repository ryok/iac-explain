# Example Terraform configuration with security issues
# This is used to demonstrate the iac-explain tool capabilities

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Public S3 bucket with multiple security issues
resource "aws_s3_bucket" "example_public" {
  bucket = var.bucket_name

  # Security Issue: Public ACL
  acl = "public-read"
}

# Missing: aws_s3_bucket_public_access_block
# Missing: server_side_encryption_configuration
# Missing: versioning configuration

# Security Group with overly permissive rules
resource "aws_security_group" "example_sg" {
  name_prefix = "example-sg"
  description = "Example security group with issues"

  # Critical Issue: SSH open to the world
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # High Risk: Database port open to the world
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Unrestricted outbound
  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 instance with security issues
resource "aws_instance" "example" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type              = "t3.micro"
  security_groups             = [aws_security_group.example_sg.name]
  associate_public_ip_address = true

  # Missing: IMDSv2 configuration
  # Issue: Public IP assignment
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}