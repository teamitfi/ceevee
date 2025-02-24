import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import { createCognito } from "./aws-cognito";

// ECR Repository configuration
const createEcrRepository = (stack: cdk.Stack): ecr.Repository => {
  return new ecr.Repository(stack, "CeeveeRepository", {
    repositoryName: "ceevee",
    removalPolicy: cdk.RemovalPolicy.DESTROY, // for dev purposes
  });
};

const getEcrRepository = (stack: cdk.Stack): ecr.IRepository => {
  return ecr.Repository.fromRepositoryName(
    stack,
    "CeeveeRepository",
    "ceevee"
  );
};

// VPC configuration
const createVpc = (stack: cdk.Stack): ec2.Vpc => {
  return new ec2.Vpc(stack, "CeeveeVPC", {
    maxAzs: 2,
    natGateways: 1,
  });
};

// ECS Cluster configuration
const createEcsCluster = (stack: cdk.Stack, vpc: ec2.Vpc): ecs.Cluster => {
  return new ecs.Cluster(stack, "CeeveeCluster", {
    vpc,
    clusterName: "ceevee-cluster",
  });
};

// Fargate Service configuration
// const createFargateService = (
//   stack: cdk.Stack,
//   cluster: ecs.Cluster
// ): ecs_patterns.ApplicationLoadBalancedFargateService => {
//   return new ecs_patterns.ApplicationLoadBalancedFargateService(
//     stack,
//     "CeeveeFargateService",
//     {
//       cluster,
//       taskImageOptions: {
//         image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
//         containerPort: 80,
//       },
//       desiredCount: 1,
//       publicLoadBalancer: true,
//     }
//   );
// };

const createDBFargateService = (
  stack: cdk.Stack,
  cluster: ecs.Cluster,
  repository: ecr.Repository | ecr.IRepository
): ecs_patterns.ApplicationLoadBalancedFargateService => {
  return new ecs_patterns.ApplicationLoadBalancedFargateService(
    stack,
    "CeeveeDBFargateService",
    {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository, 'db-latest'),
        containerPort: 5432,
        environment: {
          POSTGRES_DB: "ceevee",
          POSTGRES_USER: "postgres",
          POSTGRES_PASSWORD: "xxv&6N8TxSEcT%NTdc$zXFhL",
        }
      },
      minHealthyPercent: 100, // Ensure database availability
      maxHealthyPercent: 200, // Allow rolling updates
      desiredCount: 1,
      publicLoadBalancer: false,
      assignPublicIp: false // Ensure database is not publicly accessible
    }
  );
};

const createAPIFargateService = (
  stack: cdk.Stack,
  cluster: ecs.Cluster,
  repository: ecr.Repository | ecr.IRepository
): ecs_patterns.ApplicationLoadBalancedFargateService => {
  return new ecs_patterns.ApplicationLoadBalancedFargateService(
    stack,
    "CeeveeApiService",
    {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository, 'api-latest'),
        containerPort: 4000, // Matches EXPOSE 4000 in Dockerfile
        environment: {
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:xxv&6N8TxSEcT%NTdc$zXFhL@localhost:5432/ceevee",
          PORT: "4000"
        },
        command: ["node", "dist/server.js"]
      },
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      },
      minHealthyPercent: 50,  // Allow more flexible updates
      maxHealthyPercent: 200, // Allow parallel deployment
      desiredCount: 1,
      publicLoadBalancer: true,
      assignPublicIp: true,
      healthCheckGracePeriod: cdk.Duration.seconds(60) // Give time for Prisma migrations
    }
  );
};

/**
 * Function to create the AWS Ceevee Stack.
 * @param stack - The CDK stack where resources will be added.
 */
// Main stack creation function
export const createCeeveeStack = (stack: cdk.Stack): void => {
  // Create infrastructure in order of dependencies
  const vpc = createVpc(stack);
  const cluster = createEcsCluster(stack, vpc);
  const repository = createEcrRepository(stack)
  // const repository = getEcrRepository(stack);
  const dbService = createDBFargateService(stack, cluster, repository);
  const apiService = createAPIFargateService(stack, cluster, repository);
  
  // Create Cognito resources
  createCognito(stack);

  // Add outputs for both services
  new cdk.CfnOutput(stack, "DbLoadBalancerDNS", {
    value: dbService.loadBalancer.loadBalancerDnsName,
  });
  
  new cdk.CfnOutput(stack, "ApiLoadBalancerDNS", {
    value: apiService.loadBalancer.loadBalancerDnsName,
  });
};