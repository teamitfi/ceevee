import type { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/tokenService.js';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'access_denied', error_description: 'No token provided' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const payload = await TokenService.verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: error instanceof Error ? error.message : 'Invalid token'
    });
  }
};