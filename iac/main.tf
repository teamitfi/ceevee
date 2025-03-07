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

  project_id         = var.project_id
  region             = var.region
  environment        = var.environment
  repository_base_id = var.repository_base_id
  registry_writers   = var.registry_writers
}

module "database" {
  source = "./modules/cloud-sql"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  vpc_id      = module.network.vpc_id
  depends_on  = [module.network]
}

module "n8n" {
  source = "./modules/cloud-run-n8n"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  database_host               = module.database.database_host
  database_name               = module.database.n8n_database_name
  vpc_connector_name          = module.network.vpc_connector_name
  database_username_secret_id = module.database.n8n_username_secret_id
  database_password_secret_id = module.database.n8n_password_secret_id
  depends_on                  = [module.database, module.network]
}

module "api" {
  source = "./modules/cloud-run-api"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  domain_name            = var.api_domain_name
  api_image              = var.api_image
  network_id             = module.network.vpc_id
  vpc_connector_name     = module.network.vpc_connector_name
  database_url_secret_id = module.database.ceevee_database_url_secret_id
  repository_id          = module.registry.repository_id
  image_tag              = var.image_tag
  depends_on             = [module.database, module.network, module.registry]
}
