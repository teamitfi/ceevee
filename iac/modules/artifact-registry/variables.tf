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
  description = "ID of the Artifact Registry repository"
  type        = string
  default     = "ceevee"
}

variable "repository_description" {
  description = "Description of the Artifact Registry repository"
  type        = string
  default     = "Container registry for Ceevee applications"
}
