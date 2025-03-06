output "repository_id" {
  description = "The ID of the created Artifact Registry repository"
  value       = google_artifact_registry_repository.registry.repository_id
}

output "repository_location" {
  description = "The location of the created Artifact Registry repository"
  value       = google_artifact_registry_repository.registry.location
}
