import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from 'aws-cdk-lib/aws-logs';

interface UiStackProps extends cdk.StackProps {
  cluster: ecs.ICluster;
  repository: ecr.IRepository;
  apiUrl: string;
}

export class UiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: UiStackProps) {
    super(scope, id, props);

    // Create log group for UI service
    const logGroup = new logs.LogGroup(this, 'UiServiceLogs', {
      logGroupName: '/aws/ecs/ceevee-ui',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY 
    });

    // Create UI service
    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "CeeveeUiService", {
      cluster: props.cluster,
      cpu: 1024, // 1 vCPU
      memoryLimitMiB: 2048, // 2GB RAM
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(props.repository, 'ui-latest'),
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({
          logGroup,
          streamPrefix: 'ecs'
        }),
        environment: {
          NODE_ENV: "production",
          API_ORIGIN: props.apiUrl
        },
        containerPort: 3000,
        command: ["/bin/sh", "-c", "yarn start"],
      },
      publicLoadBalancer: true,
      assignPublicIp: true,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      },
      circuitBreaker: { rollback: true },
      healthCheckGracePeriod: cdk.Duration.seconds(60),
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
    });

    // Configure health check for the target group
    service.targetGroup.configureHealthCheck({
      path: "/",
      port: "3000",
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(5),
      interval: cdk.Duration.seconds(30),
    });

    // Add output for UI URL
    new cdk.CfnOutput(this, 'UiServiceUrl', {
      value: service.loadBalancer.loadBalancerDnsName,
      description: 'URL for UI Service'
    });

    // Add output for log group name
    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'Log Group Name for UI Service'
    });
  }
}