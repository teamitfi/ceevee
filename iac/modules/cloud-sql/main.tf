resource "google_compute_global_address" "private_ip_address" {
  name          = "ceevee-db-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = var.vpc_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = var.vpc_id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

resource "google_sql_database_instance" "instance" {
  name             = "ceevee-db-${var.environment}"
  database_version = "POSTGRES_17"
  region           = var.region

  depends_on          = [google_service_networking_connection.private_vpc_connection]
  deletion_protection = var.environment == "prod" ? true : false

  settings {
    tier            = "db-f1-micro"
    disk_autoresize = true
    disk_size       = 10
    edition         = "ENTERPRISE"

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }
    database_flags {
      name  = "log_lock_waits"
      value = "on"
    }
    database_flags {
      name  = "log_min_duration_statement"
      value = "1000"
    }
    database_flags {
      name  = "max_connections"
      value = "100"
    }
    database_flags {
      name  = "cloudsql.enable_pgaudit"
      value = "on"
    }
    database_flags {
      name  = "pgaudit.log"
      value = "all"
    }

    availability_type = "ZONAL"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.vpc_id
      enable_private_path_for_google_cloud_services = true
      ssl_mode                                      = "TRUSTED_CLIENT_CERTIFICATE_REQUIRED"
    }

    backup_configuration {
      enabled                        = true
      location                       = var.region
      start_time                     = "02:00"
      point_in_time_recovery_enabled = var.environment == "prod" ? true : false
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_sql_database" "database" {
  name     = "ceevee"
  instance = google_sql_database_instance.instance.name

  depends_on = [google_sql_database_instance.instance]

  timeouts {
    create = "20m"
  }
}

# Generate a secure random password
resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Create separate secrets for username and password
resource "google_secret_manager_secret" "db_username" {
  secret_id = "ceevee_database_username_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "ceevee_database_password_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

# Store username and password separately
resource "google_secret_manager_secret_version" "db_username" {
  secret         = google_secret_manager_secret.db_username.id
  secret_data_wo = var.database_user
}

resource "google_secret_manager_secret_version" "db_password" {
  secret         = google_secret_manager_secret.db_password.id
  secret_data_wo = random_password.db_password.result
}

# Updated to use generated password
resource "google_sql_user" "users" {
  name            = var.database_user
  instance        = google_sql_database_instance.instance.name
  password        = random_password.db_password.result
  type            = "BUILT_IN" # Explicitly set as built-in user
  deletion_policy = "ABANDON"  # Don't try to delete the postgres user

  depends_on = [
    google_sql_database_instance.instance,
    google_sql_database.database
  ]
}

# Generate SSL certificates for the database
resource "google_sql_ssl_cert" "client_cert" {
  common_name = "n8n-client"
  instance    = google_sql_database_instance.instance.name
}

# Store SSL certificates in Secret Manager
resource "google_secret_manager_secret" "db_ssl_cert" {
  secret_id = "ceevee_database_ssl_cert_${var.environment}"
  replication {
    auto {}
  }
  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret" "db_ssl_key" {
  secret_id = "ceevee_database_ssl_key_${var.environment}"
  replication {
    auto {}
  }
  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret" "db_ssl_ca" {
  secret_id = "ceevee_database_ssl_ca_${var.environment}"
  replication {
    auto {}
  }
  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret_version" "db_ssl_cert" {
  secret         = google_secret_manager_secret.db_ssl_cert.id
  secret_data_wo = google_sql_ssl_cert.client_cert.cert
}

resource "google_secret_manager_secret_version" "db_ssl_key" {
  secret         = google_secret_manager_secret.db_ssl_key.id
  secret_data_wo = google_sql_ssl_cert.client_cert.private_key
}

resource "google_secret_manager_secret_version" "db_ssl_ca" {
  secret         = google_secret_manager_secret.db_ssl_ca.id
  secret_data_wo = google_sql_ssl_cert.client_cert.server_ca_cert
}

# Construct database URL
locals {
  database_url = format("postgresql://%s:%s@%s:%d/%s",
    var.database_user,
    random_password.db_password.result,
    google_sql_database_instance.instance.private_ip_address,
    5432,
    google_sql_database.database.name
  )
}

# Create secret for the complete DATABASE_URL
resource "google_secret_manager_secret" "database_url" {
  secret_id = "ceevee_database_url_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret_version" "database_url" {
  secret         = google_secret_manager_secret.database_url.id
  secret_data_wo = local.database_url
}
