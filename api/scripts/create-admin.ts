import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser(email: string, password: string) {
  try {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('User already exists');
      return;
    }

    // Hash password with Argon2
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4
    });

    // Create admin user
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        roles: ['admin', 'user']
      }
    });

    console.log('Admin user created successfully:', user.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: yarn create-admin <email> <password>');
  process.exit(1);
}

createAdminUser(email, password);