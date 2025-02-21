#!/bin/bash

set -euo pipefail

# Get AWS account ID and set region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-eu-north-1}
REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ceevee

# Get ECS execution role ARN
ECS_EXECUTION_ROLE_ARN=$(aws cloudformation describe-stacks \
  --stack-name CeeveeStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ECSExecutionRoleArn`].OutputValue' \
  --output text)

# Build and push images with different tags
VERSION=$(git rev-parse --short HEAD)

# Export variables for envsubst
export AWS_ACCOUNT_ID
export AWS_REGION
export REPOSITORY_URI
export ECS_EXECUTION_ROLE_ARN

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build images using docker-compose
cd ..
docker-compose build

# Tag and push API image
docker tag ceevee-api:latest $REPOSITORY_URI:api-$VERSION
docker tag ceevee-api:latest $REPOSITORY_URI:api-latest
docker push $REPOSITORY_URI:api-$VERSION
docker push $REPOSITORY_URI:api-latest

# Tag and push DB image
docker tag ceevee-db:latest $REPOSITORY_URI:db-$VERSION
docker tag ceevee-db:latest $REPOSITORY_URI:db-latest
docker push $REPOSITORY_URI:db-$VERSION
docker push $REPOSITORY_URI:db-latest

# Register task definitions
cd scripts
envsubst < ./ecs/task-definitions/api.json | aws --no-cli-pager ecs register-task-definition --cli-input-json "$(cat -)"
envsubst < ./ecs/task-definitions/db.json | aws --no-cli-pager ecs register-task-definition --cli-input-json "$(cat -)"

echo "Task definitions registered successfully!"

# Update ECS services
aws ecs --no-cli-pager update-service --cluster ceevee-cluster --service ceevee-api --force-new-deployment
aws ecs --no-cli-pager update-service --cluster ceevee-cluster --service ceevee-db --force-new-deployment

echo "Deployment completed successfully!"