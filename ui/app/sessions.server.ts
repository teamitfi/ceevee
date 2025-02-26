import { createCookie, type CookieOptions } from 'react-router';
import type { LoginResponse } from '~/routes/login';

const getDomain = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.API_ORIGIN || undefined;
  }
  return undefined; // localhost for development
};

const cookieOptions: CookieOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secrets: [process.env.SESSION_SECRET || 'default'],
  secure: process.env.NODE_ENV === 'production',
  domain: getDomain()
}

const sessionCookie = createCookie('session', {
  ...cookieOptions,
  maxAge: 1800,
})
const accessTokenCookie = createCookie('accessToken', {
  ...cookieOptions,
  maxAge: 1800,
})
const refreshTokenCookie = createCookie('refreshToken', {
  ...cookieOptions,
  maxAge: 3600,
})

export const getSessionCookie = async (request: Request) => await sessionCookie.parse(request.headers.get('Cookie'));
export const getAccessTokenCookie = async (request: Request) => await accessTokenCookie.parse(request.headers.get('Cookie'));
export const getRefreshTokenCookie = async (request: Request) => await refreshTokenCookie.parse(request.headers.get('Cookie'));

export const setCookie = async (obj: object) => {
  const headers = new Headers();
  headers.append('Set-Cookie', await sessionCookie.serialize(obj));
  return headers;
}

export const setCookies = async ({ accessToken, refreshToken, user }: LoginResponse) => {
  const headers = new Headers();
  headers.append('Set-Cookie', await sessionCookie.serialize(user));
  headers.append('Set-Cookie',  await accessTokenCookie.serialize(accessToken));
  headers.append('Set-Cookie',  await refreshTokenCookie.serialize(refreshToken));
  return headers;
}

export const unsetCookies = async () => {
  const headers = new Headers();
  headers.append('Set-Cookie', await sessionCookie.serialize(null, { maxAge: 0 }));
  headers.append('Set-Cookie',  await accessTokenCookie.serialize(null, { maxAge: 0 }));
  headers.append('Set-Cookie',  await refreshTokenCookie.serialize(null, { maxAge: 0 }));
  return headers;
}