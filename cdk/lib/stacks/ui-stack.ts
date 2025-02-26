import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from 'aws-cdk-lib/aws-logs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { NetworkStack } from "./network-stack";
import { EcrStack } from "./ecr-stack";
import { ApiStack } from "./api-stack";

interface UiStackProps extends cdk.StackProps {
  networkStack: NetworkStack;
  ecrStack: EcrStack;
  apiStack: ApiStack;
  certificate?: acm.ICertificate;
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
      // Computing resources
      cluster: props.networkStack.cluster,       // ECS cluster to run in
      cpu: 1024,                                // 1 vCPU
      memoryLimitMiB: 2048,                     // 2GB RAM

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
          API_ORIGIN: `http://${props.apiStack.service.loadBalancer.loadBalancerDnsName}`
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
      circuitBreaker: { rollback: true },        // Auto-rollback on failed deployments
      healthCheckGracePeriod: cdk.Duration.seconds(60),

      // Service scaling configuration
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
    });

    // Configure ALB health check
    this.service.targetGroup.configureHealthCheck({
      path: "/",                                 // Root path for UI health check
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(5),
      interval: cdk.Duration.seconds(30),
    });

    // Commented out HTTPS configuration as CloudFront will handle HTTPS
    // // Create HTTPS listener
    // if (props.certificate) {
    //   const httpsListener = loadBalancer.addListener('HttpsListener', {
    //     port: 443,
    //     protocol: elbv2.ApplicationProtocol.HTTPS,
    //     certificates: [props.certificate],
    //     defaultTargetGroups: [targetGroup],
    //   });
    // }

    // // Create HTTP listener with redirect
    // const httpListener = loadBalancer.addListener('HttpListener', {
    //   port: 80,
    //   defaultAction: elbv2.ListenerAction.redirect({
    //     protocol: 'HTTPS',
    //     port: '443',
    //   }),
    // });

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