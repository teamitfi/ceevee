import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as logs from 'aws-cdk-lib/aws-logs';
import { NetworkStack } from "./network-stack";
import { EcrStack } from "./ecr-stack";
import { ApiStack } from "./api-stack";

interface UiStackProps extends cdk.StackProps {
  networkStack: NetworkStack;
  ecrStack: EcrStack;
  apiStack: ApiStack;
}

export class UiStack extends cdk.Stack {
  public readonly service: ecs_patterns.ApplicationLoadBalancedFargateService;

  constructor(scope: cdk.App, id: string, props: UiStackProps) {
    super(scope, id, props);

    // Create log group for UI service logs with 1-week retention
    const logGroup = new logs.LogGroup(this, 'UiServiceLogs', {
      logGroupName: '/aws/ecs/ceevee-ui',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create the Fargate service with an Application Load Balancer
    this.service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "CeeveeUiService", {
      serviceName: 'CeeveeUiService',

      // Computing resources
      cluster: props.networkStack.cluster,
      cpu: 1024,
      memoryLimitMiB: 2048,

      // Container configuration
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(props.ecrStack.repository, 'ui-latest'),
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({
          logGroup,
          streamPrefix: 'ecs'
        }),
        // Environment variables including API endpoint
        environment: {
          NODE_ENV: "production",
          API_ORIGIN: `http://${props.apiStack.service.loadBalancer.loadBalancerDnsName}`,
          CLOUDFRONT_URL: 'd3v2r0qwrxt23e.cloudfront.net'
        },
        containerPort: 3000,
        command: ["/bin/sh", "-c", "yarn start"],
      },

      // Networking configuration
      publicLoadBalancer: true, // Creates internet-facing ALB
      assignPublicIp: true, // Assigns public IP to tasks

      // Runtime configuration
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      },

      // Deployment configuration
      circuitBreaker: { rollback: true }, // Auto-rollback on failed deployments
      healthCheckGracePeriod: cdk.Duration.seconds(60),

      // Service scaling configuration
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
    });

    // Configure ALB health check
    this.service.targetGroup.configureHealthCheck({
      path: "/", // Root path for UI health check
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(5),
      interval: cdk.Duration.seconds(30),
    });

    // Add output for UI service URL
    new cdk.CfnOutput(this, 'UiServiceUrl', {
      value: this.service.loadBalancer.loadBalancerDnsName,
      description: 'URL for UI Service'
    });

    // Add output for CloudWatch Logs
    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'Log Group Name for UI Service'
    });
  }
}