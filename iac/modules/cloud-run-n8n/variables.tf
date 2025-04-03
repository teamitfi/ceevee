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

variable "image_tag" {
  description = "The tag for the n8n image to deploy"
  type        = string
  default     = "latest"
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

variable "hostname" {
  description = "The hostname for N8N service"
  type        = string
  default     = "aiexp.fi"
}

variable "service_timezone" {
  description = "Timezone for N8N service"
  type        = string
  default     = "Europe/Helsinki"
}

variable "cloud_run_resource_limits" {
  description = "Resource limits for the Cloud Run service"
  type        = map(string)
  default = {
    cpu    = "1"
    memory = "2Gi"
  }
}