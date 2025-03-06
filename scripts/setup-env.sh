#!/bin/bash

# Function to copy env file if it doesn't exist
copy_env() {
    if [ ! -f "$2" ]; then
        cp "$1" "$2"
        echo "Created $2 from template"
    else
        echo "$2 already exists, skipping..."
    fi
}

# Copy environment files
copy_env "api/.env.example" "api/.env"
copy_env "db/.env.example" "db/.env"

echo "Environment files setup complete. Please update the values in the .env files as needed."