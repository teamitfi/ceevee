import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
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

    // Add output for CloudFront URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name'
    });
  }
}