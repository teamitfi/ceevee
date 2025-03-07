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

variable "vpc_connector_name" {
  description = "The name of the VPC Serverless Connector"
  type        = string
}

variable "database_username_secret_id" {
  description = "The secret ID for the database username"
  type        = string

}

variable "database_password_secret_id" {
  description = "The secret ID for the database password"
  type        = string

}

variable "database_name" {
  description = "The name of the database to connect to"
  type        = string
}