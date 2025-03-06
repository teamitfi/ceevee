import * as fs from 'fs';
import * as path from 'path';
import { Algorithm } from 'jsonwebtoken';

// Load RSA keys
const keyDir = path.join(process.cwd(), 'keys');

export const JWT_CONFIG = {
  accessToken: {
    privateKey: fs.readFileSync(path.join(keyDir, 'access.private.pem')),
    publicKey: fs.readFileSync(path.join(keyDir, 'access.public.pem')),
    expiresIn: '30m',
  },
  refreshToken: {
    privateKey: fs.readFileSync(path.join(keyDir, 'refresh.private.pem')),
    publicKey: fs.readFileSync(path.join(keyDir, 'refresh.public.pem')),
    expiresIn: '30d',
  },
  idToken: {
    expiresIn: '30m',
  },
  issuer: 'https://auth.ceevee.dev',
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
  idToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
}