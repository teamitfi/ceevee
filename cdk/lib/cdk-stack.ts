import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { KubectlV32Layer } from '@aws-cdk/lambda-layer-kubectl-v32';

const createCognito = (stack: cdk.Stack) => {
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

const createVPC = (stack: cdk.Stack): ec2.IVpc => {
  return new ec2.Vpc(stack, 'EksVPC', {
    maxAzs: 2,
    subnetConfiguration: [
      {
        cidrMask: 24,
        name: 'Public',
        subnetType: ec2.SubnetType.PUBLIC,
      },
      {
        cidrMask: 24,
        name: 'Private',
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }
    ],
    natGateways: 1
  });
};

const createEKSCluster = (stack: cdk.Stack) => {
  // Create new VPC
  const vpc = createVPC(stack);

  // Create basic EKS cluster
  const cluster = new eks.Cluster(stack, 'EksCluster', {
    vpc,
    version: eks.KubernetesVersion.V1_32,
    clusterName: 'teamit-cluster',
    defaultCapacity: 1,
    defaultCapacityInstance: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
    kubectlLayer: new KubectlV32Layer(stack, 'KubectlLayer')
  });

  // Output important cluster information
  new cdk.CfnOutput(stack, 'EksClusterEndpoint', {
    value: cluster.clusterEndpoint,
  });
  new cdk.CfnOutput(stack, 'EksClusterName', {
    value: cluster.clusterName,
  });
}

/**
 * Function to create the AWS Cognito Stack.
 * @param stack - The CDK stack where resources will be added.
 */
export const createCeeveeStack = (stack: cdk.Stack) => {
  createCognito(stack);
  createEKSCluster(stack);
}