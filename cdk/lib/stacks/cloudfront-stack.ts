import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { ApiStack } from './api-stack';
import { UiStack } from './ui-stack';

interface CeeveeCloudFrontStackProps extends cdk.StackProps {
  apiStack: ApiStack;
  uiStack: UiStack;
}

export class CeeveeCloudFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CeeveeCloudFrontStackProps) {
    super(scope, id, props);

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: 'aiexp.fi',
      validation: acm.CertificateValidation.fromDns(),
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(props.uiStack.service.loadBalancer),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.LoadBalancerV2Origin(props.apiStack.service.loadBalancer),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
      certificate: certificate,
      domainNames: ['aiexp.fi'],
    });
  }
}