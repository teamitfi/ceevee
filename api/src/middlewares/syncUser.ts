import { CognitoUser } from "../config/cognito";
import prisma from "../db";

export const syncUser = async (decodedJwt: CognitoUser) => {
  if (!decodedJwt.sub || !decodedJwt.email) {
    console.error("syncUser: Missing required fields in JWT");
    return null;
  }

  let user = await prisma.users.findUnique({
    where: { cognitoId: decodedJwt.sub },
  });

  // Extract roles from Cognito Groups
  const roles = decodedJwt["cognito:groups"] || ["user"];

  // Update roles only if different from stored values
  if (user) {
    if (user.email !== decodedJwt.email || JSON.stringify(user.roles) !== JSON.stringify(roles)) {
      user = await prisma.users.update({
        where: { cognitoId: decodedJwt.sub },
        data: { email: decodedJwt.email, roles },
      });
    }
    return user;
  }

  // Create the user if they don’t exist
  user = await prisma.users.create({
    data: {
      cognitoId: decodedJwt.sub,
      email: decodedJwt.email,
      roles,
    },
  });
  return user
};