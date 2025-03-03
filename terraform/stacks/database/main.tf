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

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-f1-micro" # 1 vCPU, 0.6 GB memory.  We will override memory below.
    disk_autoresize = true
    disk_size       = 10 # GB
    edition         = "ENTERPRISE"
    
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.vpc_id
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled    = true
      location   = var.region
      start_time = "02:00"
    }
  }

  deletion_protection = var.environment == "prod" ? true : false
}

resource "google_sql_database" "database" {
  name     = "ceevee"
  instance = google_sql_database_instance.instance.name
}

# Create the secret in Secret Manager
resource "google_secret_manager_secret" "db_credentials" {
  secret_id = "ceevee_database_credentials_${var.environment}"
  
  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

# Store the credentials as JSON in the secret
resource "google_secret_manager_secret_version" "db_credentials" {
  secret      = google_secret_manager_secret.db_credentials.id
  secret_data = jsonencode({
    username = "postgres"
    password = random_password.db_password.result
  })
}

# Generate a secure random password
resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Updated to use generated password
resource "google_sql_user" "users" {
  name     = "ceevee_app"
  instance = google_sql_database_instance.instance.name
  password = random_password.db_password.result
}
