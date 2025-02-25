import * as cdk from "aws-cdk-lib";
import * as cr from 'aws-cdk-lib/custom-resources';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;
  public readonly bastionSecurityGroup: ec2.SecurityGroup;
  public readonly bastionHost: ec2.Instance;
  public readonly bastionKeySecret: secretsmanager.Secret;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "CeeveeVPC", {
      maxAzs: 2,
      natGateways: 1,
    });

    this.cluster = new ecs.Cluster(this, "CeeveeCluster", {
      vpc: this.vpc,
      clusterName: "ceevee-cluster",
    });

    // Create key pair with custom resource to capture the private key
    const keyPairResource = new cr.AwsCustomResource(this, 'CreateKeyPair', {
      onCreate: {
        service: 'EC2',
        action: 'createKeyPair',
        parameters: {
          KeyName: 'ceevee-bastion-key',
          KeyType: 'rsa', // Explicitly specify RSA
          KeyFormat: 'pem' // Ensure PEM format
        },
        physicalResourceId: cr.PhysicalResourceId.of('ceevee-bastion-key')
      },
      onDelete: {
        service: 'EC2',
        action: 'deleteKeyPair',
        parameters: {
          KeyName: 'ceevee-bastion-key'
        }
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
      })
    });

    // Store private key in Secrets Manager
    this.bastionKeySecret = new secretsmanager.Secret(this, 'BastionKeySecret', {
      secretName: 'ceevee/bastion/ssh-key',
      description: 'SSH private key for bastion host',
      secretStringValue: cdk.SecretValue.unsafePlainText(
        keyPairResource.getResponseField('KeyMaterial')
      ),
    });

    // Create security group for bastion host
    this.bastionSecurityGroup = new ec2.SecurityGroup(this, 'BastionSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for bastion host',
      allowAllOutbound: true,
    });

    // Allow SSH access from anywhere to bastion
    this.bastionSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access from anywhere'
    );

    // Create bastion host role
    const bastionRole = new iam.Role(this, 'BastionHostRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // Create bastion host
    this.bastionHost = new ec2.Instance(this, 'BastionHost', {
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      securityGroup: this.bastionSecurityGroup,
      role: bastionRole,
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'ImportedKeyPair', 'ceevee-bastion-key'),
    });

    // Add bastion host outputs
    new cdk.CfnOutput(this, 'BastionHostId', {
      value: this.bastionHost.instanceId,
      description: 'Bastion Host Instance ID'
    });

    new cdk.CfnOutput(this, 'BastionHostPublicDNS', {
      value: this.bastionHost.instancePublicDnsName,
      description: 'Bastion Host Public DNS'
    });

    // Add secret ARN output
    new cdk.CfnOutput(this, 'BastionKeySecretArn', {
      value: this.bastionKeySecret.secretArn,
      description: 'ARN of secret containing bastion host SSH private key'
    });
  }
}