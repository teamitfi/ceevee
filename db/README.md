# Database Setup

This folder contains the configuration for the database using Supabase.

## Files
- `Dockerfile`: Defines the Supabase database image and setup.
- `init.sql`: Initializes the database with required tables and optional seed data.

## Running the Database as Docker container
- Build and run the container:
   ```bash
   docker compose up -d ceevee-supabase-db

- Close the container:
   ```bash
   docker compose down ceevee-supabase-db

- See the logs:
    ```bash
    docker compose logs ceevee-supabase-db --tail=100

- Connect to the database container
    ```bash
   docker compose exec ceevee-supabase-db sh

- Validate content
    ```bash
    docker compose exec ceevee-supabase-db psql -U postgres -d supabase -c "SELECT * FROM users;" 
