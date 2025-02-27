import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, ListUserPoolsCommand } from "@aws-sdk/client-cognito-identity-provider";

const getUserPoolId = async (): Promise<string> => {
    const client = new CognitoIdentityProviderClient({ region: "eu-north-1" });
    
    try {
      const command = new ListUserPoolsCommand({ MaxResults: 60 });
      const response = await client.send(command);
      
      const userPool = response.UserPools?.find(pool => 
        pool.Name === 'ceevee-user-pool'
      );
  
      if (!userPool?.Id) {
        throw new Error('User pool not found');
      }
  
      return userPool.Id;
    } catch (error) {
      console.error('Error fetching user pool:', error);
      throw error;
    }
  }

export const createUser = async (email: string, password: string) => {
  const client = new CognitoIdentityProviderClient({ region: "eu-north-1" });
  const userPoolId = await getUserPoolId();

  // Create user first
  const createCommand = new AdminCreateUserCommand({
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" }
    ],
    MessageAction: "SUPPRESS" // Don't send temporary password
  });

  await client.send(createCommand);

  // Set permanent password
  const setPasswordCommand = new AdminSetUserPasswordCommand({
    UserPoolId: userPoolId,
    Username: email,
    Password: password,
    Permanent: true
  });

  await client.send(setPasswordCommand);
  
  console.log(`User created successfully: ${email} with permanent password`);
};

// CLI usage example
if (require.main === module) {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: yarn ts-node create-user.ts <email> <password>');
    process.exit(1);
  }
  createUser(email, password).catch(console.error);
}