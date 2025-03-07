# API Setup

- Select the correct node version
  ```bash
  nvm use

- Install all the dependencies:
   ```bash
   yarn install

## Database Setup

[Prisma CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)

- Applies only approved migrations in prisma/migrations/ to the database. On first setup & after pulling new changes.
   ```bash
   yarn prisma migrate deploy

- Generates the Prisma Client, ensuring TypeScript types are up to date. After migrate deploy or schema changes.
   ```bash
   yarn prisma generate

- Creates a new migration based on schema.prisma and applies it to the local database. Only for development.
   ```
   yarn prisma migrate dev --name <migration-name>

## Running the development server

- To start the API, run:
   ```bash
   yarn dev

## Running the API as Docker container
- Build and run the container:
   ```bash
   docker compose --env-file .env.docker up --build -d ceevee-api

- Build and run the container:
   ```bash
   docker compose down ceevee-api

- Check the API logs:
   ```bash
   docker logs ceevee-api --tail=100

- Connect to the api container
    ```bash
   docker compose exec ceevee-api sh

---

# 🚀 API Authentication Flow

This API uses **JWT tokens for authentication and session management**.
All API requests are authenticated using JWT tokens issued by our API.

---

## **📌 How the Login Process Works**

1️⃣ **User submits login credentials**
2️⃣ **API validates the credentials against stored hashed passwords**
3️⃣ **Issues JWT tokens (access + refresh tokens)**
4️⃣ **Frontend stores tokens for future API requests**
5️⃣ **All further requests use JWT authentication**

---

## **📌 Summary of the Login Process**

| **Step** | **Action** |
|----------|------------|
| **1. Authentication** | Frontend → API: Submit credentials: Validate user & password
| **2. Token Generation** | API: Generate & store tokens → Frontend: Return tokens
| **3. Token Usage** | Frontend: Store in HTTP-only cookies: Cryptographically verify tokens

---

## **📌 Key Takeaways**

✅ **Authentication is handled entirely by our API**

✅ **Passwords are securely hashed using Argon2**

✅ **Access tokens are short-lived (30min)**

✅ **Refresh tokens enable seamless session extension**

---