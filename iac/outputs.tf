output "n8n_url" {
  description = "The URL of the deployed n8n service"
  value       = module.n8n.service_url
}

output "database" {
  description = "The instance name"
  value       = module.database.instance_name

}
