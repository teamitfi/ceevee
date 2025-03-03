variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "database_host" {
  description = "Database host address"
  type        = string
}

variable "database_credentials_secret_id" {
  description = "Secret ID for database credentials"
  type        = string
}