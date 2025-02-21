import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

export const createCognito = (stack: cdk.Stack) => {
    // Create Cognito User Pool
    const userPool = new cognito.UserPool(stack, "AuthUserPool", {
      userPoolName: "CeeveeAuthUserPool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 16,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });
  
    // Create predefined roles using Cognito User Groups
    new cognito.CfnUserPoolGroup(stack, "AdminGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "admin",
      description: "Administrator role",
    });
    new cognito.CfnUserPoolGroup(stack, "UserGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "user",
      description: "Regular user",
    });
  
    // Create App Client
    const userPoolClient = new cognito.UserPoolClient(stack, "AuthUserPoolClient", {
      userPool: userPool,
      authFlows: { userPassword: true },
      accessTokenValidity: cdk.Duration.minutes(30),
      idTokenValidity: cdk.Duration.minutes(30),
      refreshTokenValidity: cdk.Duration.days(30),
    });
  
    // Output Cognito Resources
    new cdk.CfnOutput(stack, "AuthUserPoolId", { value: userPool.userPoolId });
    new cdk.CfnOutput(stack, "AuthCeeveeClientId", { value: userPoolClient.userPoolClientId });
  }