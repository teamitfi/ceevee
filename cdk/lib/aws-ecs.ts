import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from 'aws-cdk-lib/aws-iam';

const createECSCluster = (stack: cdk.Stack) => {
    const vpc = new ec2.Vpc(stack, 'CeeveeVPC', {
      maxAzs: 2,
      natGateways: 1
    });
  
    const cluster = new ecs.Cluster(stack, 'CeeveeCluster', {
      vpc,
      clusterName: 'ceevee-cluster',
      containerInsights: true,
      defaultCloudMapNamespace: {
        name: 'ceevee.local'
      }
    });
  
    new cdk.CfnOutput(stack, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID'
    });
  
    new cdk.CfnOutput(stack, 'ClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster Name'
    });
  
    return cluster;
  };
  
  const createECSExecutionRole = (stack: cdk.Stack) => {
    const executionRole = new iam.Role(stack, 'CeeveeECSExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      roleName: 'ceevee-ecs-execution-role',
    });
  
    executionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
    );
  
    executionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'kms:Decrypt'
        ],
        resources: [
          `arn:aws:secretsmanager:${stack.region}:${stack.account}:secret:/ceevee/*`
        ]
      })
    );
  
    new cdk.CfnOutput(stack, 'ECSExecutionRoleArn', {
      value: executionRole.roleArn,
      description: 'ECS Execution Role ARN'
    });
  
    return executionRole;
  };
  
  const createECSServices = (stack: cdk.Stack, cluster: ecs.Cluster, executionRole: iam.Role) => {
    // API Service - minimal configuration for infrastructure
    const apiTaskDef = new ecs.FargateTaskDefinition(stack, 'ApiTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole
    });
  
    apiTaskDef.addContainer('api', {
      image: ecs.ContainerImage.fromRegistry('nginx'),  // Placeholder image
      essential: true,
    });
  
    new ecs.FargateService(stack, 'CeeveeApiService', {
      cluster,
      serviceName: 'ceevee-api',
      taskDefinition: apiTaskDef,
      desiredCount: 1
    });
  
    // DB Service - minimal configuration for infrastructure
    const dbTaskDef = new ecs.FargateTaskDefinition(stack, 'DbTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole
    });
  
    dbTaskDef.addContainer('db', {
      image: ecs.ContainerImage.fromRegistry('postgres'),  // Placeholder image
      essential: true,
    });
  
    new ecs.FargateService(stack, 'CeeveeDbService', {
      cluster,
      serviceName: 'ceevee-db',
      taskDefinition: dbTaskDef,
      desiredCount: 1
    });
  };
  
  export const createECS = (stack: cdk.Stack) => {
    const cluster = createECSCluster(stack);
    const executionRole = createECSExecutionRole(stack);
    createECSServices(stack, cluster, executionRole);
  };