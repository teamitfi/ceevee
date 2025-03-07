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

variable "instance_settings" {
  description = "Database instance settings"
  type = object({
    tier            = string
    disk_autoresize = bool
    disk_size       = number
    edition         = string
  })
  default = {
    tier            = "db-f1-micro"
    disk_autoresize = true
    disk_size       = 10
    edition         = "ENTERPRISE"
  }
}