import * as cdk from "aws-cdk-lib";
import * as dotenv from 'dotenv';
import { createCeeveeStack } from "../lib/cdk-stack"; // Import the function

dotenv.config();

// Initialize CDK App
const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
}

// Create a new stack for Cognito
const stack = new cdk.Stack(app, "CeeveeStack", { env });

// Apply Cognito stack function
createCeeveeStack(stack); 

// Synthesize the stack
app.synth();