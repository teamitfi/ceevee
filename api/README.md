# API setup

- Select the correct node version
  ```bash
  nvm use

- Install all the dependencies:
   ```bash
   yarn install

## Database Setup

- Applies only approved migrations in prisma/migrations/ to the database. On first setup & after pulling new changes.
   ```bash
   yarn prisma migrate deploy

- Generates the Prisma Client, ensuring TypeScript types are up to date. After migrate deploy or schema changes.
   ```bash
   yarn prisma generate

- Creates a new migration based on schema.prisma and applies it to the local database. Only for development.
   ```bash
   yarn prisma migrate dev --name init

- Pull Existing Database Schema:
   ```bash
   yarn prisma pull

## Running the development server

- To start the API, run:
   ```bash
   yarn dev

## Running the API as Docker container
- Build and run the container:
   ```bash
   docker compose up --build -d ceevee-api

- Build and run the container:
   ```bash
   docker compose down ceevee-api

- Check the API logs:
   ```bash
   docker logs ceevee-api --tail=100

- Connect to the api container
    ```bash
   docker compose exec ceevee-api sh

- Test the API
   ```bash
   curl -X GET http://localhost:4000/api/private/users -H "Content-Type: application/json"