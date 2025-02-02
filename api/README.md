# API Setup

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
   curl -X GET http://localhost:4000/api/v1/private/users -H "Content-Type: application/json"

---

# 🚀 API Authentication Flow (AWS Cognito + JWT)

This API uses **AWS Cognito for authentication** and **JWT tokens for session management**.  
After the initial login, JWT is used to **authenticate all API requests** without needing to check AWS Cognito repeatedly.

---

## **📌 How the Login Process Works**

1️⃣ **User submits login credentials**  
2️⃣ **API validates the credentials with AWS Cognito**  
3️⃣ **Checks if the user exists in the local database**  
4️⃣ **Creates the user (if not found) and assigns a role**  
5️⃣ **Issues a JWT token**  
6️⃣ **Frontend stores the token for future API requests**  
7️⃣ **All further requests use JWT authentication** (AWS Cognito is not queried again)

---

## **📌 Full Summary of the Login Process**

| **Step** | **Action Taken** | **Database Interaction?** | **AWS Cognito Interaction?** |
|------------|----------------|--------------------------|------------------------------|
| **1. User sends login request** | Frontend sends email + password | ❌ No | ✅ Yes |
| **2. Validate credentials** | AWS Cognito verifies credentials | ❌ No | ✅ Yes |
| **3. Check if user exists** | Find user in database | ✅ Yes | ❌ No |
| **4. Create user (if needed)** | Store user with AWS Cognito ID | ✅ Yes | ❌ No |
| **5. Generate JWT** | Issue a local JWT | ❌ No | ❌ No |
| **6. Frontend stores JWT** | Store token in localStorage/cookies | ❌ No | ❌ No |
| **7. User makes authenticated request** | JWT is verified, request proceeds | ✅ Only if needed | ❌ No |

---

## **📌 Key Takeaways**
✅ **AWS Cognito is ONLY used at login.**  
✅ **Our own JWT is used for all API requests.**  
✅ **The database is ONLY queried when a user logs in (to store role & metadata).**  
✅ **No need to query AWS Cognito repeatedly.**

---