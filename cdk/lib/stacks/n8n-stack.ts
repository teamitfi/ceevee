import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { NetworkStack } from "./network-stack";
import { DatabaseStack } from "./db-stack";

interface N8nStackProps extends cdk.StackProps {
  networkStack: NetworkStack;
  databaseStack: DatabaseStack;
}

export class N8nStack extends cdk.Stack {
  public readonly service: ecs_patterns.ApplicationLoadBalancedFargateService;

  constructor(scope: cdk.App, id: string, props: N8nStackProps) {
    super(scope, id, props);

    // Create a secret for n8n environment variables
    const n8nSecret = new secretsmanager.Secret(this, 'N8nSecret', {
      secretName: 'ceevee/n8n/environment',
      secretObjectValue: {
        DB_POSTGRESDB_DATABASE: cdk.SecretValue.unsafePlainText('ceevee'),
        DB_POSTGRESDB_HOST: cdk.SecretValue.unsafePlainText(props.databaseStack.instance.instanceEndpoint.hostname),
        DB_POSTGRESDB_PORT: cdk.SecretValue.unsafePlainText('5432'),
        DB_POSTGRESDB_USER: props.databaseStack.secret.secretValueFromJson('username'),
        DB_POSTGRESDB_PASSWORD: props.databaseStack.secret.secretValueFromJson('password'),
        N8N_ENCRYPTION_KEY: cdk.SecretValue.unsafePlainText('your-random-encryption-key'),
      }
    });

    // Create log group
    const logGroup = new logs.LogGroup(this, 'N8nServiceLogs', {
      logGroupName: '/aws/ecs/ceevee-n8n',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create the Fargate service
    this.service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "CeeveeN8nService", {
      serviceName: 'CeeveeN8nService',
      cluster: props.networkStack.cluster,
      cpu: 1024,
      memoryLimitMiB: 2048,

      // Container configuration
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("n8nio/n8n"),
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({
          logGroup,
          streamPrefix: 'ecs'
        }),
        // https://docs.n8n.io/hosting/configuration/environment-variables/
        environment: {
          NODE_ENV: "production",
          DB_TYPE: "postgresdb",
          N8N_HOST: "localhost",
          N8N_PORT: "5678",
          N8N_PROTOCOL: "http",
          WEBHOOK_URL: "http://localhost:5678",
        },
        secrets: {
          DB_POSTGRESDB_DATABASE: ecs.Secret.fromSecretsManager(n8nSecret, 'DB_POSTGRESDB_DATABASE'),
          DB_POSTGRESDB_HOST: ecs.Secret.fromSecretsManager(n8nSecret, 'DB_POSTGRESDB_HOST'),
          DB_POSTGRESDB_PORT: ecs.Secret.fromSecretsManager(n8nSecret, 'DB_POSTGRESDB_PORT'),
          DB_POSTGRESDB_USER: ecs.Secret.fromSecretsManager(n8nSecret, 'DB_POSTGRESDB_USER'),
          DB_POSTGRESDB_PASSWORD: ecs.Secret.fromSecretsManager(n8nSecret, 'DB_POSTGRESDB_PASSWORD'),
          N8N_ENCRYPTION_KEY: ecs.Secret.fromSecretsManager(n8nSecret, 'N8N_ENCRYPTION_KEY'),
        },
        containerPort: 5678,
      },

      // Networking
      publicLoadBalancer: true,
      assignPublicIp: true,

      // Health check
      healthCheckGracePeriod: cdk.Duration.seconds(120),
    });

    // Configure health check
    this.service.targetGroup.configureHealthCheck({
      path: "/healthz",
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(10),
      interval: cdk.Duration.seconds(30),
    });

    // Grant database access
    props.databaseStack.secret.grantRead(this.service.taskDefinition.taskRole);
    n8nSecret.grantRead(this.service.taskDefinition.taskRole);

    // Add outputs
    new cdk.CfnOutput(this, 'N8nServiceUrl', {
      value: this.service.loadBalancer.loadBalancerDnsName,
      description: 'URL for N8N Service'
    });
  }
}