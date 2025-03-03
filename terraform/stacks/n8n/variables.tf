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