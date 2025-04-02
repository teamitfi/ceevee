variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "environment" {
  description = "The environment (e.g., dev, prod)"
  type        = string
}

variable "n8n_service_account_email" {
  description = "The service account email for the n8n Cloud Run service"
  type        = string
}

variable "min_instance_count" {
  description = "Minimum number of instances for the N8N service"
  type        = number
  default     = 1
}

variable "max_instance_count" {
  description = "Maximum number of instances for the N8N service"
  type        = number
  default     = 3
}
