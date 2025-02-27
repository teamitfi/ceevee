import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EcrStack } from '../lib/stacks/ecr-stack';
import { NetworkStack } from '../lib/stacks/network-stack';
import { CognitoStack } from '../lib/stacks/cognito-stack';
import { DatabaseStack } from '../lib/stacks/db-stack';

describe('Ceevee Infrastructure', () => {
  const env = { 
    account: '123456789012', 
    region: 'eu-north-1' 
  };

  describe('Stack Creation', () => {
    let app: cdk.App;

    beforeEach(() => {
      app = new cdk.App();
    });

    test('ECR Stack creates repository', () => {
      const stack = new EcrStack(app, 'TestEcrStack', { env });
      const template = Template.fromStack(stack);
      
      template.hasResourceProperties('AWS::ECR::Repository', {
        RepositoryName: 'ceevee'
      });
    });

    test('Network Stack creates VPC and ECS Cluster', () => {
      const stack = new NetworkStack(app, 'TestNetworkStack', { env });
      const template = Template.fromStack(stack);
      
      template.resourceCountIs('AWS::ECS::Cluster', 1);
      template.resourceCountIs('AWS::EC2::VPC', 1);
    });

    test('Cognito Stack creates User Pool', () => {
      const stack = new CognitoStack(app, 'TestCognitoStack', { env });
      const template = Template.fromStack(stack);
      
      template.resourceCountIs('AWS::Cognito::UserPool', 1);
      template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    });

    test('Database Stack creates RDS instance', () => {
      const networkStack = new NetworkStack(app, 'TestNetworkStackForDb', { env });
      const stack = new DatabaseStack(app, 'TestDatabaseStack', { 
        env,
        networkStack 
      });
      const template = Template.fromStack(stack);
      
      template.resourceCountIs('AWS::RDS::DBInstance', 1);
      template.resourceCountIs('AWS::SecretsManager::Secret', 1);
    });
  });
});