import type { Request, Response } from 'express';
import * as argon2 from 'argon2';
import prisma from '../db.js';
import { TokenService } from '../services/tokenService.js';

/**
 * @route POST /api/v1/public/login
 * @desc Authenticates a user and returns a JWT token
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Email and password are required'
    });
  }

  try {
    // Find user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'Invalid credentials'
      });
    }

    // Verify password
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'Invalid credentials'
      });
    }

    // Generate tokens
    const tokens = await TokenService.generateAuthTokens(user);

    res.json(tokens);
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: 'server_error',
      error_description: 'Authentication failed'
    });
  }
};

/**
 * @route POST /api/v1/public/refresh-token
 * @desc Refreshes a JWT token using a refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'access_denied', error_description: 'No token provided' });
  }
  const refreshToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const payload = await TokenService.verifyRefreshToken(refreshToken);

    // Find user
    const user = await prisma.users.findUnique({
      where: { id: payload.sub }
    });

    if (!user) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'User not found'
      });
    }

    // Revoke old refresh token
    await TokenService.revokeRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = await TokenService.generateAuthTokens(user);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({
      error: 'invalid_grant',
      error_description: 'Invalid refresh token'
    });
  }
};

/**
 * @route POST /api/v1/public/logout
 * @desc Logs out a user by revoking the refresh token
 */
export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'access_denied', error_description: 'No token provided' });
  }
  const refreshToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Refresh token is required'
    });
  }

  try {
    // Revoke refresh token
    await TokenService.revokeRefreshToken(refreshToken);
    res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    res.status(400).json({
      error: 'invalid_request',
      error_description: 'Invalid refresh token'
    });
  }
};