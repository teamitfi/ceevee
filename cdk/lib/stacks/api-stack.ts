import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { NetworkStack } from "./network-stack";
import { DatabaseStack } from "./db-stack";
import { CognitoStack } from "./cognito-stack";
import { EcrStack } from "./ecr-stack";

interface ApiStackProps extends cdk.StackProps {
  networkStack: NetworkStack;
  databaseStack: DatabaseStack;
  cognitoStack: CognitoStack;
  ecrStack: EcrStack;
}

export class ApiStack extends cdk.Stack {
  public readonly service: ecs_patterns.ApplicationLoadBalancedFargateService;

  constructor(scope: cdk.App, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create a new secret for API environment variables
    const apiSecret = new secretsmanager.Secret(this, 'ApiSecret', {
      secretName: 'ceevee/api/environment',
      secretObjectValue: {
        DATABASE_URL: cdk.SecretValue.unsafePlainText(
          `postgresql://${props.databaseStack.secret.secretValueFromJson('username').unsafeUnwrap()}:${props.databaseStack.secret.secretValueFromJson('password').unsafeUnwrap()}@${props.databaseStack.instance.instanceEndpoint.hostname}:5432/ceevee`
        ),
        COGNITO_CLIENT_ID: cdk.SecretValue.unsafePlainText(props.cognitoStack.userPoolClient.userPoolClientId),
        COGNITO_USER_POOL_ID: cdk.SecretValue.unsafePlainText(props.cognitoStack.userPool.userPoolId),
      }
    });

    // Create log group explicitly
    const logGroup = new logs.LogGroup(this, 'ApiServiceLogs', {
      logGroupName: '/aws/ecs/ceevee-api',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY // Be careful with this in production
    });

    this.service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "CeeveeApiService", {
      serviceName: 'CeeveeApiService',

      // Computing resources
      cpu: 2048,
      memoryLimitMiB: 4096,
      cluster: props.networkStack.cluster,

      // Container configuration
      taskImageOptions: {
        // Enable CloudWatch logging
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({
          logGroup,
          streamPrefix: 'ecs'
        }),

        // Container image and port
        image: ecs.ContainerImage.fromEcrRepository(props.ecrStack.repository, 'api-latest'),
        containerPort: 4000,

        // Environment variables
        environment: {
          NODE_ENV: "production",
          PORT: "4000",
          AWS_REGION: this.region,
        },

        // Secrets injected as environment variables
        secrets: {
          DATABASE_URL: ecs.Secret.fromSecretsManager(apiSecret, 'DATABASE_URL'),
          COGNITO_CLIENT_ID: ecs.Secret.fromSecretsManager(apiSecret, 'COGNITO_CLIENT_ID'),
          COGNITO_USER_POOL_ID: ecs.Secret.fromSecretsManager(apiSecret, 'COGNITO_USER_POOL_ID'),
        },

        // Startup command
        command: [
          "/bin/sh", 
          "-c", 
          "yarn prisma migrate deploy && exec node dist/server.js"
        ],
      },

      // Deployment configuration
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS
      },
      circuitBreaker: { rollback: true }, // Auto-rollback on failed deployments

      // Runtime configuration
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      },

      // Service scaling configuration
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
      desiredCount: 1,

      // Networking configuration
      publicLoadBalancer: true, // Creates internet-facing ALB
      assignPublicIp: true, // Assigns public IP to tasks
      
      // Container health check
      healthCheckGracePeriod: cdk.Duration.seconds(60),
      healthCheck: {
        command: ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"],
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
      }
    });

    // Load balancer health check
    this.service.targetGroup.configureHealthCheck({
      path: "/health",
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(5),
      interval: cdk.Duration.seconds(30),
    });

    // Grant permissions to secrets
    props.databaseStack.secret.grantRead(this.service.taskDefinition.taskRole);
    apiSecret.grantRead(this.service.taskDefinition.taskRole);

    // Add output for log group name
    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'Log Group Name for API Service'
    });
  }
}