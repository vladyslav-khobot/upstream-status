resource "aws_ecs_cluster" "main" {
  name = "upstream"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/upstream-api"
  retention_in_days = 14
}

data "aws_iam_policy_document" "ecs_tasks_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Lets ECS pull the image and write logs. The app itself calls no AWS APIs, so there is no task role.
resource "aws_iam_role" "api_execution" {
  name               = "upstream-api-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}

resource "aws_iam_role_policy_attachment" "api_execution" {
  role       = aws_iam_role.api_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "upstream-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.api_execution.arn

  container_definitions = jsonencode([
    {
      name         = "api"
      image        = var.api_image
      essential    = true
      portMappings = [{ containerPort = var.api_container_port, protocol = "tcp" }]
      environment = [
        { name = "PORT", value = tostring(var.api_container_port) },
        { name = "CORS_ORIGIN", value = var.web_origin },
        { name = "CACHE_TTL_MS", value = tostring(var.cache_ttl_ms) },
        { name = "UPSTREAM_TIMEOUT_MS", value = tostring(var.upstream_timeout_ms) },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "api"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "upstream-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.api_container_port
  }

  # Roll back automatically if new tasks never become healthy.
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  depends_on = [aws_lb_listener.http]
}
