#!/bin/bash

# Get specific cluster ARN by matching the cluster name
CLUSTER_NAME=$(aws ecs list-clusters --no-cli-pager --query 'clusterArns[?contains(@, `ceevee-cluster`)]' --output text)

# Get service name dynamically
SERVICE_NAME=$(aws ecs list-services --cluster $CLUSTER_NAME --no-cli-pager --query 'serviceArns[0]' --output text | awk -F'/' '{print $3}')

echo "Deploying to cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"

# Force new deployment
aws --no-cli-pager ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment

# Generate AWS Console URL
AWS_REGION=$(aws configure get region)
CONSOLE_URL="https://${AWS_REGION}.console.aws.amazon.com/ecs/v2/clusters/$(basename ${CLUSTER_NAME})/services/$(basename ${SERVICE_NAME})/deployments?region=${AWS_REGION}"

echo "Deployment initiated. Monitor status at:"
echo $CONSOLE_URL