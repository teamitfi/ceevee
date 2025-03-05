output "n8n_url" {
  description = "The URL of the deployed n8n service"
  value       = module.n8n.service_url
}

output "api_service_url" {
  description = "The URL of the API service"
  value       = module.api.service_url
}

output "api_load_balancer_ip" {
  description = "The IP address of the API load balancer"
  value       = module.api.load_balancer_ip
}