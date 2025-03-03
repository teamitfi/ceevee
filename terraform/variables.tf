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

variable "kms_key_name" {
  description = "The name of the KMS key used for encrypting secrets"
  type        = string
  default     = null # If null, Google-managed encryption will be used
}
