# data "google_secret_manager_secret_version" "database_url" {
#   secret = var.database_url_secret
# }

# Configure Cloud Run service
resource "google_cloud_run_v2_service" "api" {
  name                = "ceevee-api-${var.environment}"
  location            = var.region
  deletion_protection = false

  template {
    service_account = google_service_account.api.email

    vpc_access {
      connector = "projects/${var.project_id}/locations/${var.region}/connectors/${var.vpc_connector_name}"
      egress    = "ALL_TRAFFIC"
    }

    containers {
      image = var.api_image

      command = ["/bin/sh", "-c"]
      args    = ["yarn prisma migrate deploy && exec node dist/server.js"]

      resources {
        limits = {
          cpu    = var.cpu_limit
          memory = var.memory_limit
        }
      }

      ports {
        container_port = 4000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = var.database_url_secret
            version = "latest"
          }
        }
      }

      startup_probe {
        http_get {
          path = "/health"
          port = 4000
        }
        initial_delay_seconds = 30 # Increased to allow for slower startups
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 4000
        }
        initial_delay_seconds = 40
        period_seconds        = 15
        timeout_seconds       = 5
        failure_threshold     = 3
      }
    }

    scaling {
      min_instance_count = var.min_scale
      max_instance_count = var.max_scale
    }
  }
}

# Make the service publicly accessible
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Load balancer with SSL
resource "google_compute_global_address" "api" {
  name = "ceevee-api-address-${var.environment}"
}

resource "google_compute_global_forwarding_rule" "api" {
  name       = "ceevee-api-forwarding-rule-${var.environment}"
  target     = google_compute_target_https_proxy.api.id
  port_range = "443"
  ip_address = google_compute_global_address.api.address
}

resource "google_compute_managed_ssl_certificate" "api" {
  name = "ceevee-api-cert-${var.environment}"

  managed {
    domains = [var.domain_name]
  }
}

resource "google_compute_target_https_proxy" "api" {
  name             = "ceevee-api-https-proxy-${var.environment}"
  url_map          = google_compute_url_map.api.id
  ssl_certificates = [google_compute_managed_ssl_certificate.api.id]
}

resource "google_compute_url_map" "api" {
  name            = "ceevee-api-url-map-${var.environment}"
  default_service = google_compute_backend_service.api.id
}

resource "google_compute_backend_service" "api" {
  name        = "ceevee-api-backend-${var.environment}"
  protocol    = "HTTP"
  timeout_sec = 30

  backend {
    group = google_compute_region_network_endpoint_group.api.id
  }

  health_checks = [google_compute_health_check.api.id]
}

# Health check configuration
resource "google_compute_health_check" "api" {
  name               = "ceevee-api-health-check-${var.environment}"
  timeout_sec        = 5
  check_interval_sec = 30

  http_health_check {
    port         = 4000
    request_path = "/health"
  }
}

# Network Endpoint Group for Cloud Run
resource "google_compute_region_network_endpoint_group" "api" {
  name                  = "ceevee-api-neg-${var.environment}"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_v2_service.api.name
  }
}

# Service account for Cloud Run
resource "google_service_account" "api" {
  account_id   = "ceevee-api-sa-${var.environment}"
  display_name = "Ceevee API Service Account"
}

# Grant necessary permissions
resource "google_project_iam_member" "api_secretmanager" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "api_cloudrun" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.api.email}"
}