import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/stacks/ecr-stack';
import { NetworkStack } from '../lib/stacks/network-stack';
import { DatabaseStack } from '../lib/stacks/db-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { UiStack } from '../lib/stacks/ui-stack';
import { CeeveeCloudFrontStack } from '../lib/stacks/cloudfront-stack';
import { N8nStack } from '../lib/stacks/n8n-stack';

const region = "eu-north-1";
const env = { region };

const app = new cdk.App();

// Infrastructure stacks
const ecrStack = new EcrStack(app, 'CeeveeEcrStack', { env });
const networkStack = new NetworkStack(app, 'CeeveeNetworkStack', { env });

// Database stack
const databaseStack = new DatabaseStack(app, 'CeeveeDbStack', { env, networkStack });

// API stack
const apiStack = new ApiStack(app, 'CeeveeApiStack', {
  env,
  ecrStack,
  networkStack,
  databaseStack,
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

// Add N8N stack
const n8nStack = new N8nStack(app, 'CeeveeN8nStack', {
  env,
  networkStack,
  databaseStack
});
n8nStack.addDependency(databaseStack);

// CloudFront stack
const cloudFrontStack = new CeeveeCloudFrontStack(app, 'CeeveeCloudFrontStack', {
  env: { region: 'us-east-1' },
  crossRegionReferences: true,
  apiStack,
  uiStack,
  n8nStack,
  region
});
cloudFrontStack.addDependency(uiStack);
cloudFrontStack.addDependency(apiStack);

app.synth();