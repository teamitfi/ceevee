variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-north1"
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
  default     = "dev"
}

variable "vpc_connector_cidr" {
  description = "CIDR range for VPC connector"
  type        = string
  default     = "10.8.0.0/28"
}

variable "vpc_connector_machine_type" {
  description = "Machine type for VPC connector instances"
  type        = string
  default     = "f1-micro"
}

variable "vpc_connector_min_instances" {
  description = "Minimum number of instances for VPC connector"
  type        = number
  default     = 2
}

variable "vpc_connector_max_instances" {
  description = "Maximum number of instances for VPC connector"
  type        = number
  default     = 3
}