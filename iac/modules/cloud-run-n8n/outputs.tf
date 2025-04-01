output "service_url" {
  description = "The URL of the deployed N8N service"
  value       = google_cloud_run_v2_service.n8n.uri
}

output "service_name" {
  description = "The name of the N8N Cloud Run service"
  value       = google_cloud_run_v2_service.n8n.name
}

output "service_account_email" {
  description = "The service account email for the n8n Cloud Run service"
  value       = google_service_account.n8n.email
}
