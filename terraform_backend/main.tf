provider "aws" {
  region = "us-east-1"  
}

variable "db_password" {
  type    = string
}

variable "master_username" {
  type    = string
}

resource "aws_db_instance" "my_vr_rds" {
  identifier = "my-vr-rds"
  allocated_storage    = 20
  max_allocated_storage = 20 //autoscaling false
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "15.5"
  instance_class       = "db.t3.micro"
  db_name              = "mydb"
  username             = var.master_username
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  deletion_protection = true
  publicly_accessible   = false

  vpc_security_group_ids = [aws_security_group.instance.id]

  tags = {
    Name = "MyPostgresDB"
  }
}



resource "aws_security_group" "instance" {
  name = "terraform-vr-instance"
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
 egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
   }
 
}

