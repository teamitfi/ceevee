# 🚀 AWS CDK - Infrastructure for Ceevee

This module creates Ceevee CloudFormation stack using AWS CDK:
- A **Cognito User Pool** for user authentication.
- A **User Pool Client** for app-based authentication.
- Outputs for **User Pool ID** and **App Client ID**.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## References
- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/home.html)

## Instructions

- Configure AWS CLI with SSO:
    ```bash
    aws configure sso

- Check if your AWS CLI is configured:
    ```bash
    aws configure list
  
- See AWS profile information:
    ```bash
    aws sts get-caller-identity

- Synthesize the CloudFormation template:
    ```bash
    cdk synth

- Deploy the stack:
    ```bash
    cdk deploy

- Destroy the stack:
    ```bash
    cdk destroy