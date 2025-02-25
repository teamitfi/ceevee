import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  bastionSecurityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly instance: rds.DatabaseInstance;
  public readonly secret: secretsmanager.ISecret;

  constructor(scope: cdk.App, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // Create security group for RDS
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for RDS PostgreSQL',
      allowAllOutbound: true
    });

    // Allow access from ECS cluster
    props.cluster.connections.allowTo(
      dbSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow access from ECS tasks'
    );

    dbSecurityGroup.addIngressRule(
      props.bastionSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from bastion host'
    );

    // Create RDS instance
    this.instance = new rds.DatabaseInstance(this, 'CeeveeDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO
      ),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'ceevee',
      credentials: rds.Credentials.fromGeneratedSecret('postgres', {
        secretName: 'ceevee/database/credentials'
      }),
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: false,
      storageEncrypted: true,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    // Store reference to the secret
    this.secret = this.instance.secret!;

    // Output the endpoint
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.instance.instanceEndpoint.hostname,
      description: 'Database endpoint'
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {  
      value: this.secret.secretArn,
      description: 'Database credentials secret ARN'
    });
  }
}