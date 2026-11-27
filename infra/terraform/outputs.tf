output "api_url" {
  description = "Public URL of the API load balancer."
  value       = "http://${aws_lb.api.dns_name}"
}
