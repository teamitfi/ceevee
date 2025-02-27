import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { NetworkStack } from "./network-stack";

interface DatabaseStackProps extends cdk.StackProps {
  networkStack: NetworkStack;
}

export class DatabaseStack extends cdk.Stack {
  public readonly instance: rds.DatabaseInstance;
  public readonly secret: secretsmanager.ISecret;

  constructor(scope: cdk.App, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // Create security group for RDS
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: props.networkStack.vpc,
      description: 'Security group for RDS PostgreSQL',
      allowAllOutbound: true
    });

    dbSecurityGroup.addIngressRule(
      props.networkStack.bastionSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from bastion host'
    );

    // Allow access from anywhere in the VPC
    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.networkStack.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from within VPC'
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
      vpc: props.networkStack.vpc,
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
      removalPolicy: cdk.RemovalPolicy.RETAIN,  // Never delete automatically
      deletionProtection: true,
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