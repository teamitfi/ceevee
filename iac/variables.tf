variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "environment" {
  description = "The environment for the infrastructure (e.g., dev, staging, prod)"
  type        = string
}

variable "region" {
  description = "The region to deploy resources"
  type        = string
  default     = "us-central1"
}

variable "api_domain_name" {
  description = "The domain name for the API service"
  type        = string
}

variable "api_image" {
  description = "The container image URL for the API service"
  type        = string
}

variable "min_scale" {
  description = "Minimum number of API instances"
  type        = number
  default     = 1
}

variable "max_scale" {
  description = "Maximum number of API instances"
  type        = number
  default     = 10
}

variable "memory_limit" {
  description = "Memory limit per API instance"
  type        = string
  default     = "4Gi"
}

variable "cpu_limit" {
  description = "CPU limit per API instance"
  type        = string
  default     = "2000m"
}

variable "repository_id" {
  description = "The ID of the Artifact Registry repository"
  type        = string
  default     = "ceevee"
}

variable "repository_description" {
  description = "Description of the Artifact Registry repository"
  type        = string
  default     = "Container registry for Ceevee applications"
}