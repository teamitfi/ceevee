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
    tier = var.environment == "prod" ? "db-custom-2-4096" : "db-f1-micro"
    
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

resource "google_sql_user" "users" {
  name     = "ceevee_app"
  instance = google_sql_database_instance.instance.name
  password = var.database_password
}
