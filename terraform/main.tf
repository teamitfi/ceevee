terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  backend "gcs" {
    bucket = "ceevee-terraform-state"
    prefix = "terraform/state/dev"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "environment" {
  description = "The environment for the infrastructure (e.g., dev, staging, prod)"
  type        = string
}

module "network" {
  source = "./stacks/network"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

module "database" {
  source = "./stacks/database"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  vpc_id      = module.network.vpc_id
}

module "n8n" {
  source = "./stacks/n8n"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  database_host      = module.database.database_connection.host
  vpc_connector_name = module.network.vpc_connector_name
}

# Additional modules will be added here (similar to CDK stacks):
# - Cloud Run (similar to ECS)
# - Cloud SQL (similar to RDS)
# - IAM (similar to Cognito)
# - Storage (similar to S3)