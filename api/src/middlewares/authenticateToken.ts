import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';
import { COGNITO_ISSUER } from '../config/cognito.js';

dotenv.config();

// Initialize JWKS client
const client = jwksClient({
  jwksUri: `${COGNITO_ISSUER}/.well-known/jwks.json`,
});

// Function to get the signing key
const getKey = (header: any, callback: any) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Middleware to authenticate JWT using AWS Cognito
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Access denied. No token provided.' });

  // Ensure token does not include "Bearer " prefix
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  // Verify JWT using Cognito’s public key
  jwt.verify(accessToken, getKey, { issuer: COGNITO_ISSUER }, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please refresh your token.' });
      }
      return res.status(403).json({ message: 'Invalid token', error: err.message });
    }

    const jwtPayload = decoded as JwtPayload;
    req.user = {
      cognitoId: jwtPayload.sub,
      roles: jwtPayload['cognito:groups'] || ['user'],
    };
    next();
  });
};