resource "google_service_account" "browserless" {
  account_id   = "browserless-${var.environment}"
  display_name = "Service Account for Browserless"
  project      = var.project_id
}

resource "google_cloud_run_v2_service" "browserless" {
  name     = "browserless-${var.environment}"
  location = var.region

  template {
    service_account = google_service_account.browserless.email
    containers {
      image = "browserless/chrome"

      resources {
        limits = var.cloud_run_resource_limits
      }

      ports {
        container_port = 3000
      }
      env {
        name = "TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.browserless_token.id
            version = "latest"
          }
        }
      }
      env {
        name  = "CORS"
        value = "true"
      }
      env {
        name  = "DEBUG"
        value = "*"
      }
    }
    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }
  }
}

resource "google_secret_manager_secret" "browserless_token" {
  secret_id = "ceevee_browserless_token_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "random_password" "browserless_token" {
  length  = 32
  special = false
}

resource "google_secret_manager_secret_iam_member" "browserless_token_access" {
  secret_id = google_secret_manager_secret.browserless_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.browserless.email}"
}

resource "google_secret_manager_secret_version" "browserless_token" {
  secret_data_wo = random_password.browserless_token.result
  secret         = google_secret_manager_secret.browserless_token.id
}

resource "google_cloud_run_v2_service_iam_member" "invoker" {
  name     = google_cloud_run_v2_service.browserless.name
  location = var.region
  project  = var.project_id
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.n8n_service_account_email}"
}

