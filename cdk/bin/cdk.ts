import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/stacks/ecr-stack';
import { NetworkStack } from '../lib/stacks/network-stack';
import { DatabaseStack } from '../lib/stacks/db-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { CognitoStack } from '../lib/stacks/cognito-stack';
import { UiStack } from '../lib/stacks/ui-stack';
import { CeeveeCloudFrontStack } from '../lib/stacks/cloudfront-stack';

const region = "eu-north-1";
const env = { region };

const app = new cdk.App();

// Infrastructure stacks
const ecrStack = new EcrStack(app, 'CeeveeEcrStack', { env });
const networkStack = new NetworkStack(app, 'CeeveeNetworkStack', { env });
const cognitoStack = new CognitoStack(app, 'CeeveeCognitoStack', { env });

// Database stack
const databaseStack = new DatabaseStack(app, 'CeeveeDbStack', { env, networkStack });

// API stack
const apiStack = new ApiStack(app, 'CeeveeApiStack', {
  env,
  ecrStack,
  networkStack,
  databaseStack,
  cognitoStack
});
apiStack.addDependency(databaseStack);

// UI stack
const uiStack = new UiStack(app, 'CeeveeUiStack', {
  env,
  ecrStack,
  networkStack,
  apiStack
});
uiStack.addDependency(apiStack);

// CloudFront stack
const cloudFrontStack = new CeeveeCloudFrontStack(app, 'CeeveeCloudFrontStack', {
  env: { region: 'us-east-1' },
  crossRegionReferences: true,
  apiStack,
  uiStack,
  region
});
cloudFrontStack.addDependency(uiStack);
cloudFrontStack.addDependency(apiStack);

app.synth();