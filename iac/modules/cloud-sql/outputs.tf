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

output "database_url_secret" {
  description = "The secret ID for the database URL"
  value       = google_secret_manager_secret.database_url.id
}