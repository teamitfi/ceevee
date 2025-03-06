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

variable "repository_id" {
  description = "Base repository ID (will be suffixed with environment)"
  type        = string
}

variable "repository_description" {
  description = "Description of the Artifact repository repository"
  type        = string
  default     = "Container repository for Ceevee applications"
}
