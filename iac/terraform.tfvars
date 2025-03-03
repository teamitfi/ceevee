# Base Configuration
project_id  = "ai-tools-452306" # Your GCP project ID
region      = "europe-north1"   # Default region for resources
environment = "dev"             # Use "dev" for development environment

# API Configuration
api_domain_name = "api.ceevee.dev"                                                    # Replace with your actual domain
api_image       = "europe-north1-docker.pkg.dev/ai-tools-452306/ai-tools/api:50f4302" # Replace with your image path
min_scale       = 1                                                                   # Minimum number of instances
max_scale       = 10                                                                  # Maximum number of instances
memory_limit    = "2Gi"                                                               # Memory limit per instance
cpu_limit       = "1000m"                                                             # CPU limit per instance

# Registry Configuration
repository_base_id     = "ai-tools"
repository_description = "Container registry for Ceevee applications"

registry_writers = [
  "sebastian.nikkonen@teamit.fi",
  "andreas.granqvist@teamit.fi"
]
