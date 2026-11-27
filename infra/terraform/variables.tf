variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "vpc_id" {
  description = "Existing VPC to deploy into."
  type        = string
}

variable "public_subnet_ids" {
  description = "Subnets for the load balancer."
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Subnets for the API tasks. They need outbound internet (NAT) to reach status pages."
  type        = list(string)
}

variable "api_image" {
  description = "API container image, e.g. <account>.dkr.ecr.<region>.amazonaws.com/upstream-api:<sha>."
  type        = string
}

variable "web_origin" {
  description = "Origin the web app is served from; used for CORS."
  type        = string
}

variable "api_desired_count" {
  description = "Number of API tasks. Each task has its own in-memory cache and polls every status page independently."
  type        = number
  default     = 8
}

variable "api_container_port" {
  description = "Must match the PORT the API listens on."
  type        = number
  default     = 3001
}

variable "cache_ttl_ms" {
  type    = number
  default = 10000
}

variable "upstream_timeout_ms" {
  description = "Keep well below the load balancer idle timeout, or the LB cuts requests off first."
  type        = number
  default     = 45000
}

variable "admin_token" {
  description = "Token for /api/admin/* endpoints."
  type        = string
  sensitive   = true
}
