variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "api_image" {
  description = "Full URL of the API container image"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the API"
  type        = string
}

variable "network_id" {
  description = "The ID of the VPC network"
  type        = string
}

variable "vpc_connector_name" {
  description = "Name of the VPC connector for Cloud Run"
  type        = string
}

variable "min_scale" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_scale" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "memory_limit" {
  description = "Memory limit for Cloud Run service"
  type        = string
  default     = "2Gi" # 4 GB
}

variable "cpu_limit" {
  description = "CPU limit for Cloud Run service"
  type        = string
  default     = "1000m" # 2 vCPU
}

variable "database_url_secret_id" {
  description = "The Secret Manager secret ID for the database URL"
  type        = string
}

variable "repository_id" {
  description = "The ID of the Artifact Registry repository"
  type        = string
}

variable "image_tag" {
  description = "The tag of the container image"
  type        = string
}