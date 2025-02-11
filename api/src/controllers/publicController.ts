import type { Request, Response } from 'express';
import {
  InitiateAuthCommand,
  NotAuthorizedException,
  UserNotFoundException
} from '@aws-sdk/client-cognito-identity-provider';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {syncUser} from '../middlewares/syncUser.js';
import {cognitoClient} from '../config/cognito.js';

dotenv.config();

/**
 * @route POST /api/v1/public/login
 * @desc Authenticates a user via AWS Cognito and returns a JWT token
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    // Call AWS Cognito to authenticate the user
    const authCommand = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const authResponse = await cognitoClient.send(authCommand);

    if (!authResponse.AuthenticationResult || !authResponse.AuthenticationResult.IdToken) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    // Decode the JWT to get the Cognito user data
    const decoded = jwt.decode(authResponse.AuthenticationResult.IdToken) as any;
    if (!decoded || !decoded.sub) {
      return res.status(500).json({ message: 'Invalid token payload' });
    }

    // Sync user immediately after login
    const user = await syncUser(decoded);
    if (!user) {
      return res.status(500).json({ message: 'User synchronization failed' });
    }

    // Return the AWS Cognito JWT token
    res.json({
      accessToken: authResponse.AuthenticationResult.AccessToken,
      refreshToken: authResponse.AuthenticationResult.RefreshToken,
      expiresIn: authResponse.AuthenticationResult.ExpiresIn,
      user,
    });
  } catch (error: any) {
    // Handle common Cognito errors
    if (error instanceof UserNotFoundException) {
      return res.status(404).json({ message: 'User not found' });
    } else if (error instanceof NotAuthorizedException) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    } else {
      return res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
  }
};

/**
 * @route POST /api/v1/public/refresh-token
 * @desc Refreshes a JWT token using a refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });

  try {
    const refreshCommand = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: { REFRESH_TOKEN: refreshToken },
    });

    const authResponse = await cognitoClient.send(refreshCommand);

    if (!authResponse.AuthenticationResult || !authResponse.AuthenticationResult.IdToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    res.json({
      accessToken: authResponse.AuthenticationResult.AccessToken,
      refreshToken: authResponse.AuthenticationResult.RefreshToken,
      expiresIn: authResponse.AuthenticationResult.ExpiresIn,
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ message: 'Token refresh failed', error: error.message });
  }
};