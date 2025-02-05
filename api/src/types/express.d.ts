declare namespace Express {
  import type { CognitoUser } from "../config/cognito";
  export interface Request {
    user?: CognitoUser;
  }
}