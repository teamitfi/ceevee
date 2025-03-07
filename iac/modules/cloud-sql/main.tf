resource "google_compute_global_address" "private_ip_address" {
  name          = "ceevee-db-ip-${var.environment}"
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
    tier            = var.instance_settings.tier
    disk_autoresize = var.instance_settings.disk_autoresize
    disk_size       = var.instance_settings.disk_size
    edition         = var.instance_settings.edition

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
      ssl_mode                                      = "ENCRYPTED_ONLY"
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

# Define local variables for usernames
locals {
  n8n_username    = "n8n_user"
  ceevee_username = "ceevee_user"
}

resource "google_sql_database" "n8n" {
  name     = "n8n"
  instance = google_sql_database_instance.instance.name

  depends_on = [google_sql_database_instance.instance]

  timeouts {
    create = "20m"
  }
}

resource "google_sql_database" "ceevee" {
  name     = "ceevee"
  instance = google_sql_database_instance.instance.name

  depends_on = [google_sql_database_instance.instance]

  timeouts {
    create = "20m"
  }
}

# Generate secure random passwords
resource "random_password" "n8n_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "ceevee_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Create secrets for usernames and passwords
resource "google_secret_manager_secret" "n8n_username" {
  secret_id = "n8n_database_username_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret" "ceevee_username" {
  secret_id = "ceevee_database_username_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret" "n8n_password" {
  secret_id = "n8n_database_password_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret" "ceevee_password" {
  secret_id = "ceevee_database_password_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

# Store usernames and passwords
resource "google_secret_manager_secret_version" "n8n_username" {
  secret         = google_secret_manager_secret.n8n_username.id
  secret_data_wo = local.n8n_username
}

resource "google_secret_manager_secret_version" "ceevee_username" {
  secret         = google_secret_manager_secret.ceevee_username.id
  secret_data_wo = local.ceevee_username
}

resource "google_secret_manager_secret_version" "n8n_password" {
  secret         = google_secret_manager_secret.n8n_password.id
  secret_data_wo = random_password.n8n_password.result
}

resource "google_secret_manager_secret_version" "ceevee_password" {
  secret         = google_secret_manager_secret.ceevee_password.id
  secret_data_wo = random_password.ceevee_password.result
}

# Create database users
resource "google_sql_user" "n8n_user" {
  name            = local.n8n_username
  instance        = google_sql_database_instance.instance.name
  password_wo     = random_password.n8n_password.result
  type            = "BUILT_IN"
  deletion_policy = "ABANDON"

  depends_on = [
    google_sql_database_instance.instance,
    google_sql_database.n8n
  ]
}

resource "google_sql_user" "ceevee_user" {
  name            = local.ceevee_username
  instance        = google_sql_database_instance.instance.name
  password_wo     = random_password.ceevee_password.result
  type            = "BUILT_IN"
  deletion_policy = "ABANDON"

  depends_on = [
    google_sql_database_instance.instance,
    google_sql_database.ceevee
  ]
}

# Construct database URLs
locals {
  n8n_database_url = format("postgresql://%s:%s@%s:%d/%s",
    local.n8n_username,
    random_password.n8n_password.result,
    google_sql_database_instance.instance.private_ip_address,
    5432,
    google_sql_database.n8n.name
  )
  ceevee_database_url = format("postgresql://%s:%s@%s:%d/%s",
    local.ceevee_username,
    random_password.ceevee_password.result,
    google_sql_database_instance.instance.private_ip_address,
    5432,
    google_sql_database.ceevee.name
  )
}

# Create secrets for the complete DATABASE_URLs
resource "google_secret_manager_secret" "n8n_database_url" {
  secret_id = "n8n_database_url_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret" "ceevee_database_url" {
  secret_id = "ceevee_database_url_${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret_version" "n8n_database_url" {
  secret         = google_secret_manager_secret.n8n_database_url.id
  secret_data_wo = local.n8n_database_url
}

resource "google_secret_manager_secret_version" "ceevee_database_url" {
  secret         = google_secret_manager_secret.ceevee_database_url.id
  secret_data_wo = local.ceevee_database_url
}
