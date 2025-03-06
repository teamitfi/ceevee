export const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.CLOUDFRONT_URL ? `https://${process.env.CLOUDFRONT_URL}` : process.env.API_ORIGIN
  }
  return process.env.API_ORIGIN || 'http://localhost:4000';
};

export const setHeaders = (accessToken: string)=> {
  return {
    Authorization: `Bearer ${accessToken}`,
    credentials: 'include',
    'Content-Type': 'application/json',
  };
}