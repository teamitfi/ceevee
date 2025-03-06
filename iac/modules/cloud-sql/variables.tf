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

variable "vpc_id" {
  description = "VPC ID where database will be deployed"
  type        = string
}

variable "database_user" {
  description = "The database user to create"
  type        = string
  default     = "postgres"
}