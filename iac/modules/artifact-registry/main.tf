resource "google_artifact_registry_repository" "registry" {
  location      = var.region
  repository_id = "${var.repository_base_id}-${var.environment}"
  description   = var.repository_description
  format        = "DOCKER"
}

resource "google_artifact_registry_repository_iam_member" "writers" {
  for_each   = toset(var.registry_writers)
  location   = google_artifact_registry_repository.registry.location
  repository = google_artifact_registry_repository.registry.repository_id
  role       = "roles/artifactregistry.writer"
  member     = "user:${each.value}"
}
