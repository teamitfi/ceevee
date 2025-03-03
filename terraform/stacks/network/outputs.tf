output "vpc_id" {
  description = "The ID of the VPC network"
  value       = google_compute_network.vpc.id
}

output "vpc_connector_id" {
  description = "The ID of the VPC Serverless Connector"
  value       = google_vpc_access_connector.connector.id
}

output "vpc_connector_name" {
  description = "The name of the VPC Serverless Connector"
  value       = google_vpc_access_connector.connector.name
}