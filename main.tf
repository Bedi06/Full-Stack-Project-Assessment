terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region  = "eu-west-2"

}

resource "aws_s3_bucket" "my_vr_tf" {
  bucket = "my-vr-tf"
   force_destroy = false

  tags = {
    Name        = "My bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_ownership_controls" "my_vr_tf_ownership" {
  bucket = aws_s3_bucket.my_vr_tf.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "my_vr_tf_acl" {
  bucket = aws_s3_bucket.my_vr_tf.id
  acl    = "public-read"
}

resource "aws_s3_bucket_public_access_block" "my_vr_tf_block" {
  bucket = aws_s3_bucket.my_vr_tf.id
  block_public_acls   = false
  block_public_policy = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
resource "aws_s3_bucket_policy" "my_vr_tf_policy" {
  bucket = aws_s3_bucket.my_vr_tf.id
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-vr-tf/*"
        }
    ]
}
EOF
  
}


resource "aws_s3_bucket_cors_configuration" "my_vr_tf_cors" {
  bucket = aws_s3_bucket.my_vr_tf.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "DELETE", "POST", "PUT"]
    allowed_origins = ["*"]
    expose_headers  = ["x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"]

  }
  
}

resource "aws_s3_bucket_website_configuration" "my_vr_tf_website" {
  bucket = aws_s3_bucket.my_vr_tf.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }

  
}