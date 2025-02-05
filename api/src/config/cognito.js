import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import dotenv from "dotenv";
dotenv.config();
// Initialize AWS Cognito Client
export const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
export const COGNITO_ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;
