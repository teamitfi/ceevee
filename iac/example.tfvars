# Base Configuration
project_id  = "my-sample-project"
region      = "europe-north1"
environment = "dev"

# n8n Configuration
database_host               = "sample-db-host"
database_name               = "n8n"
vpc_connector_name          = "my-vpc-connector"
database_username_secret_id = "my-n8n-username-id-ref"
database_password_secret_id = "my-n8n-password-id-ref"
n8n_image_tag               = "latest"

# API Configuration
api_domain_name = "api.example.com"
api_image_name  = "europe-north1-docker.pkg.dev/my-sample-project/my-repo/api"
api_image_tag   = "latest"
min_scale       = 1
max_scale       = 3
memory_limit    = "1Gi"
cpu_limit       = "500m"

# Registry Configuration
repository_base_id     = "my-repo"
repository_description = "Sample container registry"

registry_writers = [
  "user1@example.com",
  "user2@example.com"
]
