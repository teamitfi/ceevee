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
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "network" {
  source = "./modules/vpc"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

module "registry" {
  source = "./modules/artifact-registry"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

module "database" {
  source = "./modules/cloud-sql"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  vpc_id     = module.network.vpc_id
  depends_on = [module.network]
}

module "n8n" {
  source = "./modules/cloud-run-n8n"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  database_host      = module.database.database_connection.host
  vpc_connector_name = module.network.vpc_connector_name
  depends_on         = [module.database]
}

# module "api" {
#   source = "./modules/api"

#   project_id  = var.project_id
#   region      = var.region
#   environment = var.environment

#   domain_name         = var.api_domain_name
#   api_image           = var.api_image
#   network_id          = module.network.vpc_id
#   vpc_connector_name  = module.network.vpc_connector_name
#   database_url_secret = module.database.database_url_secret
#   depends_on          = [module.database]
# }
