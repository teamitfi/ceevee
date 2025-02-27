import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import { ApiStack } from './api-stack';
import { UiStack } from './ui-stack';
import { N8nStack } from './n8n-stack';

interface CeeveeCloudFrontStackProps extends cdk.StackProps {
  apiStack: ApiStack;
  uiStack: UiStack;
  n8nStack: N8nStack;
  region: string;
}

export class CeeveeCloudFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CeeveeCloudFrontStackProps) {
    super(scope, id, props);

    // Main distribution for UI and API
    const mainDistribution = new cloudfront.Distribution(this, 'Distribution', {
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

    // Separate distribution for n8n
    const n8nDistribution = new cloudfront.Distribution(this, 'N8nDistribution', {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(props.n8nStack.service.loadBalancer, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      }
    });

    // Add output for CloudFront URL for ui and api
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: mainDistribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name'
    });


    // Add output for CloudFront URL for n8n
    new cdk.CfnOutput(this, 'N8nDistributionDomainName', {
      value: n8nDistribution.distributionDomainName,
      description: 'N8n CloudFront Distribution Domain Name'
    });
  }
}