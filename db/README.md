# Database Setup

This folder contains the configuration for the database using PostgreSQL.

## Files
- `Dockerfile`: Defines the PostgreSQL database image and setup.
- `init.sql`: Initializes the database with required tables and optional seed data.

## Running the Database as Docker container
- Build and run the container:
   ```bash
   docker compose --env-file .env.docker up --build -d ceevee-db

- Close the container:
   ```bash
   docker compose down ceevee-db

- Close the container and remove volumes/orphans:
   ```bash
   docker compose down ceevee-db --volumes --remove-orphans

- See the logs:
    ```bash
    docker compose logs ceevee-db --tail=100

- Connect to the db container
    ```bash
   docker compose exec ceevee-db sh

- Connect to the db container
    ```bash
    docker exec -it ceevee-db psql -U root -d ceevee
