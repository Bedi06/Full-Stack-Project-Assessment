provider "aws" {
  region = "us-east-1"  
}

resource "aws_db_instance" "my_vr_rds" {
  identifier = "my-vr-rds"
  allocated_storage    = 20
  max_allocated_storage = 20 //autoscaling false
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "15.5"
  instance_class       = "db.t3.micro"
  db_name              = "mydatabase"
  username             = var.db_username
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
  name = "terraform-example-instance"
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "null_resource" "create_table" {
  provisioner "local-exec" {
    command = <<-EOF
      export PGPASSWORD=${var.db_password}
      psql -h ${aws_db_instance.my_db_instance.address} -U ${var.db_username} -d mydatabase -c "CREATE TABLE videos (id SERIAL PRIMARY KEY, name VARCHAR(255), url VARCHAR(255), upvotes INT DEFAULT 0, downvotes INT DEFAULT 0);"
    EOF
  }
  depends_on = [aws_db_instance.my_db_instance]
}
