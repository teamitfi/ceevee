output "instance_name" {
  description = "The name of the database instance"
  value       = google_sql_database_instance.instance.name
}

output "database_connection" {
  description = "Database connection details"
  value = {
    host     = google_sql_database_instance.instance.private_ip_address
    database = google_sql_database.database.name
    username = google_sql_user.users.name
  }
  sensitive = true
}

output "database_credentials_secret_id" {
  description = "Secret ID for database credentials"
  value       = google_secret_manager_secret.db_credentials.id
}
