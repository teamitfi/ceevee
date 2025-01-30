import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET must be provided');
}

export interface DecodedUser {
  id: string;         // Unique ID from database
  cognitoId: string;  // AWS Cognito User ID
  email: string;      // User Email
  role: string;       // Role (e.g., "user", "admin")
  createdAt: string;  // ISO Date format
}

export const generateToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token: string): DecodedUser | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as DecodedUser;
  } catch (error) {
    return null;
  }
};