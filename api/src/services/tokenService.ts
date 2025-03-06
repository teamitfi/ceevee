import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_CONFIG, TokenPayload, AuthTokens } from '../config/oauth.js';
import prisma from '../db.js';

export class TokenService {
  private static createSignOptions(expiresIn: string | number): SignOptions {
    return {
      algorithm: 'RS256' as Algorithm,
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    };
  }

  static async generateAuthTokens(user: { id: string; email: string; roles: string[] }): Promise<AuthTokens> {
    const basePayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      iss: JWT_CONFIG.issuer,
      iat: Math.floor(Date.now() / 1000),
    };

    // Generate access token with limited scope
    const accessToken = jwt.sign(
      { ...basePayload, scope: ['api:access'] },
      JWT_CONFIG.accessToken.privateKey,
      this.createSignOptions(JWT_CONFIG.accessToken.expiresIn)
    );

    // Generate ID token with user info
    const idToken = jwt.sign(
      { ...basePayload },
      JWT_CONFIG.accessToken.privateKey,
      this.createSignOptions(JWT_CONFIG.idToken.expiresIn)
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { ...basePayload, scope: ['api:refresh'] },
      JWT_CONFIG.refreshToken.privateKey,
      this.createSignOptions(JWT_CONFIG.refreshToken.expiresIn)
    );

    // Store refresh token in database
    const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds
    await prisma.refreshToken.create({
      data: {
        token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        userId: user.id,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    return {
      accessToken: accessToken,
      idToken: idToken,
      refreshToken: refreshToken,
      tokenType: 'Bearer',
      expiresIn: 30 * 60, // 30 minutes in seconds
      scope: ['api:access'],
    };
  }

  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, JWT_CONFIG.accessToken.publicKey, {
        algorithms: ['RS256' as Algorithm],
        issuer: JWT_CONFIG.issuer,
      });
      return payload as TokenPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, JWT_CONFIG.refreshToken.publicKey, {
        algorithms: ['RS256' as Algorithm],
        issuer: JWT_CONFIG.issuer,
      });

      // Check if refresh token exists and is not revoked
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: hashedToken },
        include: { user: true },
      });

      prisma.refreshToken

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid refresh token');
      }

      return payload as TokenPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.refreshToken.update({
      where: { token: hashedToken },
      data: { revokedAt: new Date() },
    });
  }
}