resource "google_compute_network" "vpc" {
  name                    = "ceevee-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "private" {
  name          = "ceevee-private"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id

  private_ip_google_access = true
}

resource "google_compute_subnetwork" "public" {
  name          = "ceevee-public"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Similar to bastion host security group
resource "google_compute_firewall" "bastion" {
  name    = "ceevee-bastion"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["bastion"]
}

# Create Serverless VPC connector
resource "google_vpc_access_connector" "connector" {
  name          = "vpc-con-${var.environment}"  # Shorter, environment-specific name
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc.name
  region        = var.region

  # Standard-tier connector with minimal number of instances
  machine_type = "f1-micro"
  min_instances = 2
  max_instances = 3
}