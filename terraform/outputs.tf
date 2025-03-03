output "bucket_url" {
  description = "The URL of the created bucket"
  value       = "gs://${google_storage_bucket.bucket.name}"
}
