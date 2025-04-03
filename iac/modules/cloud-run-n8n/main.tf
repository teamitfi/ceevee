# Create service account for N8N
resource "google_service_account" "n8n" {
  account_id   = "n8n-${var.environment}"
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
  secret_data_wo = random_password.n8n_encryption_key.result
}

# IAM: Allow Cloud Run service to access secrets
resource "google_secret_manager_secret_iam_member" "n8n_encryption_key_access" {
  secret_id = google_secret_manager_secret.n8n_encryption_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.n8n.email}"
}
resource "google_secret_manager_secret_iam_member" "database_username_access" {
  secret_id = var.database_username_secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.n8n.email}"
}

resource "google_secret_manager_secret_iam_member" "database_password_access" {
  secret_id = var.database_password_secret_id
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
  name                = "n8n-${var.environment}"
  location            = var.region
  deletion_protection = false

  lifecycle {
    ignore_changes = [
      template[0].containers[0].env,
      client,
      client_version
    ]
  }

  template {
    vpc_access {
      connector = "projects/${var.project_id}/locations/${var.region}/connectors/${var.vpc_connector_name}"
      egress    = "ALL_TRAFFIC"
    }

    service_account = google_service_account.n8n.email

    containers {
      image = "n8nio/n8n:${var.image_tag}"

      resources {
        limits = var.cloud_run_resource_limits
      }

      # Port configuration for Cloud Run
      ports {
        container_port = 8080
      }
      env {
        name  = "GENERIC_TIMEZONE"
        value = var.service_timezone
      }
      env {
        name  = "N8N_HOST"
        value = "n8n-${var.environment}.${var.hostname}"
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
        value = var.database_name
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
            secret  = var.database_username_secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "DB_POSTGRESDB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.database_password_secret_id
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
      env {
        name  = "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD"
        value = "true"
      }
      env {
        name  = "NODE_FUNCTION_ALLOW_EXTERNAL"
        value = "google-auth-library"
      }
      startup_probe {
        http_get {
          path = "/healthz"
          port = 8080
        }
        initial_delay_seconds = 180
        timeout_seconds       = 10
        period_seconds        = 30
        failure_threshold     = 5
      }
    }

    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }
  }
}

resource "null_resource" "update_post_depl_env_vars" {
  depends_on = [google_cloud_run_v2_service.n8n]

  provisioner "local-exec" {
    command = <<EOF
      gcloud run services update n8n-${var.environment} \
        --region ${var.region} \
        --update-env-vars="WEBHOOK_URL=${google_cloud_run_v2_service.n8n.uri}"
    EOF
  }
}
