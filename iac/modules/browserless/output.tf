
output "service_url" {
  description = "The URL of the deployed Browserless service"
  value       = google_cloud_run_v2_service.browserless.uri
}
output "service_name" {
  description = "The name of the Browserless Cloud Run service"
  value       = google_cloud_run_v2_service.browserless.name
}
