import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import dotenv from "dotenv";

dotenv.config();

// Initialize AWS Cognito Client
export const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export const COGNITO_ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;

export interface DatabaseUser {
  id: string;               // Unique ID from database
  cognitoId: string;        // AWS Cognito User ID
  email: string;            // User Email
  roles: string[];          // Roles (e.g., ["user", "admin"])
  createdAt?: string;       // ISO Date format
}

export type Role = 'admin' | 'user';

export interface CognitoUser {
  sub: string,
  email_verified: boolean,
  iss: string,
  'cognito:username': string,
  'cognito:groups'?: string[],
  origin_jti: string,
  aud: string,
  event_id: string,
  token_use: string,
  auth_time: number,
  exp: number,
  iat: number,
  jti: string,
  email: string
}

