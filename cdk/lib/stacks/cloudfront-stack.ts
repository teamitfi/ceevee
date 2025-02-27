import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ApiStack } from './api-stack';
import { UiStack } from './ui-stack';

interface CeeveeCloudFrontStackProps extends cdk.StackProps {
  apiStack: ApiStack;
  uiStack: UiStack;
  region: string;
}

export class CeeveeCloudFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CeeveeCloudFrontStackProps) {
    super(scope, id, props);

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(props.uiStack.service.loadBalancer, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.LoadBalancerV2Origin(props.apiStack.service.loadBalancer, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
    });

    const name = '/ceevee/cloudfront/url';
    const parameters = {
      Name: name,
      Value: distribution.distributionDomainName,
      Type: 'String',
      Description: 'CloudFront Distribution Domain Name'
    }
    // Create a Custom Resource to save parameter in base region
    new cr.AwsCustomResource(this, 'CrossRegionParameter', {
      onCreate: {
        service: 'SSM',
        action: 'putParameter',
        parameters: parameters,
        region: props.region,
        physicalResourceId: cr.PhysicalResourceId.of(name)
      },
      onUpdate: {
        service: 'SSM',
        action: 'putParameter',
        parameters: {...parameters, Overwrite: true },
        region: props.region,
        physicalResourceId: cr.PhysicalResourceId.of(name)
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['ssm:PutParameter'],
          resources: [`arn:aws:ssm:${props.region}:${this.account}:parameter${name}`],
          effect: iam.Effect.ALLOW
        })
      ])
    });

    // Add output for CloudFront URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name'
    });
  }
}