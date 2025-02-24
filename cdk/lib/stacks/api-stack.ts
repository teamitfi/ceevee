import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

interface ApiStackProps extends cdk.StackProps {
  cluster: ecs.ICluster;
  repository: ecr.IRepository;
  dbSecret: secretsmanager.ISecret;
  dbEndpoint: string;
  cognitoClientId: string;
  cognitoUserPoolId: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create a new secret for API environment variables
    const apiSecret = new secretsmanager.Secret(this, 'ApiSecret', {
      secretName: 'ceevee/api/environment',
      secretObjectValue: {
        DATABASE_URL: cdk.SecretValue.unsafePlainText(
          `postgresql://${props.dbSecret.secretValueFromJson('username').unsafeUnwrap()}:${props.dbSecret.secretValueFromJson('password').unsafeUnwrap()}@${props.dbEndpoint}:5432/ceevee`
        ),
        COGNITO_CLIENT_ID: cdk.SecretValue.unsafePlainText(props.cognitoClientId),
        COGNITO_USER_POOL_ID: cdk.SecretValue.unsafePlainText(props.cognitoUserPoolId),
      }
    });

    // Create log group explicitly
    const logGroup = new logs.LogGroup(this, 'ApiServiceLogs', {
      logGroupName: '/aws/ecs/ceevee-api',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY // Be careful with this in production
    });

    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "CeeveeApiService", {
      cpu: 2048,
      memoryLimitMiB: 4096,
      cluster: props.cluster,
      taskImageOptions: {
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({
          logGroup,
          streamPrefix: 'ecs'
        }),
        image: ecs.ContainerImage.fromEcrRepository(props.repository, 'api-latest'),
        containerPort: 4000,
        environment: {
          NODE_ENV: "production",
          PORT: "4000",
          AWS_REGION: this.region,
        },
        secrets: {
          DATABASE_URL: ecs.Secret.fromSecretsManager(apiSecret, 'DATABASE_URL'),
          COGNITO_CLIENT_ID: ecs.Secret.fromSecretsManager(apiSecret, 'COGNITO_CLIENT_ID'),
          COGNITO_USER_POOL_ID: ecs.Secret.fromSecretsManager(apiSecret, 'COGNITO_USER_POOL_ID'),
        },
        command: [
          "/bin/sh", 
          "-c", 
          "yarn prisma migrate deploy && exec node dist/server.js"
        ],
      },
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS
      },
      circuitBreaker: { rollback: true },
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      },
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
      desiredCount: 1,
      publicLoadBalancer: true,
      assignPublicIp: true,
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
    service.targetGroup.configureHealthCheck({
      path: "/health",
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(5),
      interval: cdk.Duration.seconds(30),
    });

    // Grant permissions to secrets
    props.dbSecret.grantRead(service.taskDefinition.taskRole);
    apiSecret.grantRead(service.taskDefinition.taskRole);

    // Add output for log group name
    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'Log Group Name for API Service'
    });
  }
}