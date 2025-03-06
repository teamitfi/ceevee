resource "google_artifact_registry_repository" "registry" {
  location      = var.region
  repository_id = "${var.repository_id}-${var.environment}"
  description   = var.repository_description
  format        = "DOCKER"
}

# IAM binding for Cloud Run to pull images
resource "google_artifact_registry_repository_iam_member" "cloudrun_reader" {
  location   = google_artifact_registry_repository.registry.location
  repository = google_artifact_registry_repository.registry.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
}
