import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_CONFIG, TokenPayload, AuthTokens } from '../config/oauth.js';
import prisma from '../db.js';

type TimeUnit = 's' | 'm' | 'h' | 'd';

export const parseTimeToSeconds = (time: string): number => {
  const match = time.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid time format. Use format: <number><unit> (e.g., 30m, 1d)');
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  const multipliers: Record<TimeUnit, number> = {
    's': 1,
    'm': 60,
    'h': 60 * 60,
    'd': 24 * 60 * 60
  };

  return numValue * multipliers[unit as TimeUnit];
};

const createSignOptions = (expiresIn: string | number): SignOptions => ({
  algorithm: 'RS256' as Algorithm,
  expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
});

export const generateAuthTokens = async (user: { id: string; email: string; roles: string[] }): Promise<AuthTokens> => {
  const basePayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience,
    iat: Math.floor(Date.now() / 1000),
  }

  // Generate access token with limited scope
  const accessToken = jwt.sign(
    { ...basePayload, scope: ['api:access'] },
    JWT_CONFIG.accessToken.privateKey,
    createSignOptions(JWT_CONFIG.accessToken.expiresIn)
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    {
      sub: user.id,
      iss: JWT_CONFIG.issuer,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
      scope: ['api:refresh']
    },
    JWT_CONFIG.refreshToken.privateKey,
    createSignOptions(JWT_CONFIG.refreshToken.expiresIn)
  );

  // Store refresh token in database
  const expiresIn = parseTimeToSeconds(JWT_CONFIG.refreshToken.expiresIn);
  await prisma.refreshToken.create({
    data: {
      token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      userId: user.id,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: parseTimeToSeconds(JWT_CONFIG.accessToken.expiresIn),
    scope: ['api:access'],
  };
};

export const verifyAccessToken = async (token: string): Promise<TokenPayload> => {
  try {
    const payload = jwt.verify(token, JWT_CONFIG.accessToken.publicKey, {
      algorithms: ['RS256' as Algorithm],
      issuer: JWT_CONFIG.issuer,
    });
    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

const verifyStoredRefreshToken = async (token: string) => {
  // Check if refresh token exists and is not revoked
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new Error('Invalid refresh token');
  }
}

export const verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
  try {
    const payload = jwt.verify(token, JWT_CONFIG.refreshToken.publicKey, {
      algorithms: ['RS256' as Algorithm],
      issuer: JWT_CONFIG.issuer,
    });

    await verifyStoredRefreshToken(token);
    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.refreshToken.update({
    where: { token: hashedToken },
    data: { revokedAt: new Date() },
  });
};