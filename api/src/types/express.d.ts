declare namespace Express {
  import { DecodedUser } from "../config/cognito";
  export interface Request {
    user?: DecodedUser;
  }
}