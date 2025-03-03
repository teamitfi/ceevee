# Create service account for N8N
resource "google_service_account" "n8n" {
  account_id   = "ceevee-n8n-${var.environment}"
  display_name = "Service Account for N8N"
  project      = var.project_id
}

# Create encryption key secret
resource "google_secret_manager_secret" "n8n_encryption_key" {
  secret_id = "ceevee_n8n_encryption_key_${var.environment}"
  
  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

# Generate and store encryption key
resource "random_password" "n8n_encryption_key" {
  length  = 32
  special = false
}

resource "google_secret_manager_secret_version" "n8n_encryption_key" {
  secret         = google_secret_manager_secret.n8n_encryption_key.id
  secret_data    = random_password.n8n_encryption_key.result
}

# IAM: Allow Cloud Run service to access secrets
resource "google_secret_manager_secret_iam_member" "n8n_encryption_key_access" {
  secret_id = google_secret_manager_secret.n8n_encryption_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.n8n.email}"
}

resource "google_secret_manager_secret_iam_member" "database_username_access" {
  secret_id = "ceevee_database_username_${var.environment}"
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.n8n.email}"
}

resource "google_secret_manager_secret_iam_member" "database_password_access" {
  secret_id = "ceevee_database_password_${var.environment}"
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.n8n.email}"
}

# Make the service publicly accessible
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.n8n.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Create Cloud Run service
resource "google_cloud_run_v2_service" "n8n" {
  name     = "ceevee-n8n-${var.environment}"
  location = var.region
  deletion_protection = false

  template {
    vpc_access {
      connector = "projects/${var.project_id}/locations/${var.region}/connectors/${var.vpc_connector_name}"
      egress = "ALL_TRAFFIC"
    }
    
    service_account = google_service_account.n8n.email
    
    containers {
      image = "n8nio/n8n:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "2Gi"
        }
      }

      # Port configuration for Cloud Run
      ports {
        container_port = 8080
      }
      env {
        name  = "N8N_HOST"
        value = "0.0.0.0"
      }
      env {
        name  = "N8N_PORT"
        value = "8080"
      }
      env {
        name  = "N8N_PROTOCOL"
        value = "https"
      }
      env {
        name  = "DB_TYPE"
        value = "postgresdb"
      }
      env {
        name  = "DB_POSTGRESDB_DATABASE"
        value = "ceevee"
      }
      env {
        name  = "DB_POSTGRESDB_HOST"
        value = var.database_host
      }
      env {
        name  = "DB_POSTGRESDB_PORT"
        value = "5432"
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS"
        value = "true"
      }
      env {
        name  = "N8N_RUNNERS_ENABLED"
        value = "true"
      }
      env {
        name  = "DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED"
        value = "false"
      }
      env {
        name = "DB_POSTGRESDB_USER"
        value_source {
          secret_key_ref {
            secret = "ceevee_database_username_${var.environment}"
            version = "latest"
          }
        }
      }
      env {
        name = "DB_POSTGRESDB_PASSWORD"
        value_source {
          secret_key_ref {
            secret = "ceevee_database_password_${var.environment}"
            version = "latest"
          }
        }
      }
      env {
        name = "N8N_ENCRYPTION_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.n8n_encryption_key.id
            version = "latest"
          }
        }
      }

      # Set startup probe (similar to AWS health check)
      startup_probe {
        http_get {
          path = "/healthz"
          port = 8080
        }
        initial_delay_seconds = 120
        timeout_seconds = 10
        period_seconds = 30
        failure_threshold = 3
      }
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 3
    }
  }
}

# Get the URL after the service is created
data "google_cloud_run_v2_service" "n8n" {
  name     = google_cloud_run_v2_service.n8n.name
  location = google_cloud_run_v2_service.n8n.location

  depends_on = [google_cloud_run_v2_service.n8n]
}