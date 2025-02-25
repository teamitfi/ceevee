import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/stacks/ecr-stack';
import { NetworkStack } from '../lib/stacks/network-stack';
import { DatabaseStack } from '../lib/stacks/db-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { CognitoStack } from '../lib/stacks/cognito-stack';

const region = "eu-north-1";
const env = { region: region };

const app = new cdk.App();

// Infrastructure stacks
const ecrStack = new EcrStack(app, 'CeeveeEcrStack', { env });

const networkStack = new NetworkStack(app, 'CeeveeNetworkStack', { env });
const cognitoStack = new CognitoStack(app, 'CeeveeCognitoStack', { env });

// Database stack
const databaseStack = new DatabaseStack(app, 'CeeveeDbStack', {
  vpc: networkStack.vpc,
  bastionSecurityGroup: networkStack.bastionSecurityGroup,
  env
});

// API stack
const apiStack = new ApiStack(app, 'CeeveeApiStack', {
  cluster: networkStack.cluster,
  repository: ecrStack.repository,
  dbEndpoint: databaseStack.instance.instanceEndpoint.hostname,
  dbSecret: databaseStack.secret,
  cognitoClientId: cognitoStack.userPoolClient.userPoolClientId,
  cognitoUserPoolId: cognitoStack.userPool.userPoolId,
  env
});

// Add dependency
apiStack.addDependency(databaseStack);

app.synth();