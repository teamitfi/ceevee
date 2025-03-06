import * as fs from 'fs';
import * as path from 'path';
import { Algorithm } from 'jsonwebtoken';

export const validateOAuthConfig = () => {
  const missingValues: string[] = [];

  // Check environment variables
  if (!process.env.AUTH_ISSUER) missingValues.push('AUTH_ISSUER');
  if (!process.env.TOKEN_AUDIENCE) missingValues.push('TOKEN_AUDIENCE');
  if (!process.env.ACCESS_TOKEN_EXPIRY) missingValues.push('ACCESS_TOKEN_EXPIRY');
  if (!process.env.REFRESH_TOKEN_EXPIRY) missingValues.push('REFRESH_TOKEN_EXPIRY');

  // Check RSA key files
  const requiredKeys = [
    'access.private.pem',
    'access.public.pem',
    'refresh.private.pem',
    'refresh.public.pem'
  ];

  requiredKeys.forEach(key => {
    const keyPath = path.join(keyDir, key);
    if (!fs.existsSync(keyPath)) {
      missingValues.push(`RSA Key: ${key}`);
    }
  });

  if (missingValues.length > 0) {
    throw new Error(
      `Missing required OAuth configuration values:\n${missingValues.join('\n')}`
    );
  }
}

// Load RSA keys
const keyDir = path.join(process.cwd(), 'keys');

validateOAuthConfig();

export const JWT_CONFIG = {
  accessToken: {
    privateKey: fs.readFileSync(path.join(keyDir, 'access.private.pem')),
    publicKey: fs.readFileSync(path.join(keyDir, 'access.public.pem')),
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string,
  },
  refreshToken: {
    privateKey: fs.readFileSync(path.join(keyDir, 'refresh.private.pem')),
    publicKey: fs.readFileSync(path.join(keyDir, 'refresh.public.pem')),
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string,
  },
  issuer: process.env.AUTH_ISSUER,
  audience: process.env.TOKEN_AUDIENCE,
  algorithms: ['RS256' as Algorithm],
};

export interface TokenPayload {
  sub: string;          // Subject (user ID)
  email: string;        // User's email
  roles: string[];      // User's roles
  scope?: string[];     // OAuth scopes
  iat?: number;         // Issued at
  exp?: number;         // Expires at
  iss?: string;         // Issuer
  aud?: string;         // Audience
  jti?: string;         // JWT ID
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
}