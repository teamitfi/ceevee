import * as cdk from "aws-cdk-lib";
import { createCeeveeStack } from "../lib/cdk-stack"; // Import the function

// Initialize CDK App
const app = new cdk.App();

// Create a new stack for Cognito
const stack = new cdk.Stack(app, "CeeveeStack", { env: { region: "eu-north-1" } });

// Apply Cognito stack function
createCeeveeStack(stack);

// Synthesize the stack
app.synth();