# Database Setup

This folder contains the configuration for the database using Supabase.

## Files
- `Dockerfile`: Defines the Supabase database image and setup.
- `init.sql`: Initializes the database with required tables and optional seed data.

## Running the Database as Docker container
- Build and run the container:
   ```bash
   docker compose up --build -d ceevee-db

- Close the container:
   ```bash
   docker compose down ceevee-db

- See the logs:
    ```bash
    docker compose logs ceevee-db --tail=100

- Connect to the db container
    ```bash
   docker compose exec ceevee-db sh

- Validate content
    ```bash
    docker compose exec ceevee-db psql -U postgres -d supabase -c "SELECT * FROM users;" 
