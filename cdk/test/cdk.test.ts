import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { createCeeveeStack } from "../lib/cdk-stack"; // Import the Cognito function

describe("AWS CDK Cognito Stack", () => {
  let template: Template;

  beforeAll(() => {
    // Create a test CDK app and stack
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestCognitoStack");

    // Apply the Cognito function to the test stack
    createCeeveeStack(stack);

    // Convert the stack into a CloudFormation template for assertions
    template = Template.fromStack(stack);
  });

  test("Cognito User Pool is created", () => {
    template.hasResource("AWS::Cognito::UserPool", {});
  });

  test("Cognito User Pool has the correct properties", () => {
    template.hasResourceProperties("AWS::Cognito::UserPool", {
      UserPoolName: "CeeveeAuthUserPool",
      AutoVerifiedAttributes: ["email"],
    });
  });

  test("Cognito User Pool Client is created", () => {
    template.hasResource("AWS::Cognito::UserPoolClient", {});
  });

  test("Cognito User Pool Client has the correct authentication flows", () => {
    template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
      ExplicitAuthFlows: [
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH"
      ],
    });
  });

  test("Password Policy is applied correctly", () => {
    template.hasResourceProperties("AWS::Cognito::UserPool", {
      Policies: {
        PasswordPolicy: {
          MinimumLength: 16,
          RequireUppercase: true,
          RequireNumbers: true,
          RequireSymbols: true,
        },
      },
    });
  });

  test("Outputs User Pool ID and App Client ID", () => {
    const outputs = template.findOutputs("*");

    expect(outputs).toHaveProperty("AuthUserPoolId");
    expect(outputs.AuthUserPoolId.Value.Ref).toContain("AuthUserPool")

    expect(outputs).toHaveProperty("AuthCeeveeClientId");
    expect(outputs.AuthCeeveeClientId.Value.Ref).toContain("AuthCeeveeClient")
  });
});