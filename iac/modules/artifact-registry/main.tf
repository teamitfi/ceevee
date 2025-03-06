resource "google_artifact_registry_repository" "registry" {
  location      = var.region
  repository_id = "${var.repository_id}-${var.environment}"
  description   = var.repository_description
  format        = "DOCKER"
}
