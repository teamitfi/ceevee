# Ceevee

Implement db, api and ui for a service to interact with LLMs
- db uses Supabase Docker image
- api uses express.js for REST API, prisma for ORM to access db

## Docker Setup

- Build and run the containers:
   ```bash
   docker compose up --build -d

- Close the containers:
   ```bash
   docker compose down --volumes --remove-orphans