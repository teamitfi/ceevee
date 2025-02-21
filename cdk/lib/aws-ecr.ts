import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";

export const createECRRepository = (stack: cdk.Stack) => {
  const repository = new ecr.Repository(stack, 'CeeveeRepository', {
    repositoryName: 'ceevee',
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    lifecycleRules: [
      {
        maxImageCount: 5,
        description: 'Keep only 5 latest images per tag'
      }
    ]
  });

  new cdk.CfnOutput(stack, 'CeeveeRepositoryUri', {
    value: repository.repositoryUri,
    description: 'The URI of the Ceevee repository'
  });

  return repository;
};