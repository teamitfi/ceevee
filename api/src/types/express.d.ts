declare namespace Express {
  import { CognitoUser } from "../config/cognito";
  export interface Request {
    user?: CognitoUser;
  }
}