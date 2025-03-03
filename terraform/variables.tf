variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region to deploy resources"
  type        = string
  default     = "us-central1"
}

variable "bucket_name" {
  description = "The name of the storage bucket"
  type        = string
}

variable "database_password" {
  description = "Password for database user"
  type        = string
  sensitive   = true
}
