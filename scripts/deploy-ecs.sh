#!/bin/bash

set -euo pipefail

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

# REGION="eu-north-1"

# # Get specific cluster ARN by matching the cluster name
# CLUSTER_NAME=$(aws ecs list-clusters --no-cli-pager --query 'clusterArns[?contains(@, `ceevee-cluster`)]' --output text)

# # Get service name dynamically
# SERVICE_NAME=$(aws ecs list-services --cluster $CLUSTER_NAME --no-cli-pager --query 'serviceArns[0]' --output text | awk -F'/' '{print $3}')

# echo "Deploying to cluster: $CLUSTER_NAME"
# echo "Service: $SERVICE_NAME"

# # Check Parameter Store value first
# echo "Checking CloudFront URL from Parameter Store:"
# CLOUDFRONT_URL=$(aws ssm get-parameter \
#     --name "/ceevee/cloudfront/url" \
#     --region eu-north-1 \
#     --query "Parameter.Value" \
#     --output text)
# echo "Found CloudFront URL in Parameter Store: ${CLOUDFRONT_URL}"

# # Update the task definition with the new URL
# TASK_DEF=$(aws ecs describe-task-definition \
#     --task-definition $(aws ecs describe-services \
#         --cluster $CLUSTER_NAME \
#         --services $SERVICE_NAME \
#         --query 'services[0].taskDefinition' \
#         --output text))
# # Create new task definition with updated environment variable
# NEW_TASK_DEF=$(echo $TASK_DEF | jq '.taskDefinition' | jq '.containerDefinitions[0].environment |= map(if .name == "CLOUDFRONT_URL" then .value = "'$CLOUDFRONT_URL'" else . end)')

# # Register new task definition
# aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF"

# # Force new deployment with updated task definition
# aws --no-cli-pager ecs update-service \
#   --cluster $CLUSTER_NAME \
#   --service $SERVICE_NAME \
#   --force-new-deployment

# # Generate AWS Console URL
# AWS_REGION=$(aws configure get region)
# CONSOLE_URL="https://${AWS_REGION}.console.aws.amazon.com/ecs/v2/clusters/$(basename ${CLUSTER_NAME})/services/$(basename ${SERVICE_NAME})/deployments?region=${AWS_REGION}"

# echo "Deployment initiated with updated CloudFront URL. Monitor status at:"
# echo $CONSOLE_URL