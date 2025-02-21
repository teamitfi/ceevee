import * as cdk from "aws-cdk-lib";
import { createCognito } from "./aws-cognito";
import { createECRRepository } from "./aws-ecr";
import { createECS } from "./aws-ecs";

export const createCeeveeStack = (stack: cdk.Stack) => {
  createCognito(stack);
  createECRRepository(stack);
  createECS(stack);
};