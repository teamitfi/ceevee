output "service_url" {
  description = "The URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.api.uri
}

output "load_balancer_ip" {
  description = "The IP address of the global load balancer"
  value       = google_compute_global_address.api.address
}

output "service_name" {
  description = "The name of the Cloud Run service"
  value       = google_cloud_run_v2_service.api.name
}

output "service_location" {
  description = "The GCP region where the service is deployed"
  value       = google_cloud_run_v2_service.api.location
}

output "secret_id" {
  description = "The ID of the database URL secret"
  value       = google_secret_manager_secret.database_url.secret_id
}