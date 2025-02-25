#!/bin/bash

set -euo pipefail

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
AWS_REGION=$(aws configure get region)
REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ceevee"
VERSION=$(git rev-parse --short HEAD)

# Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}".dkr.ecr."${AWS_REGION}".amazonaws.com

# Build and push API image
echo "🏗️  Building API image..."
docker build -t ceevee-api:latest ./api
docker tag ceevee-api:latest "${REPOSITORY_URI}":api-latest
docker tag ceevee-api:latest "${REPOSITORY_URI}":api-"${VERSION}"
docker push "${REPOSITORY_URI}":api-latest
docker push "${REPOSITORY_URI}":api-"${VERSION}"

echo "✅ All images pushed successfully with tags:"
echo "   - ${REPOSITORY_URI}:api-latest, ${REPOSITORY_URI}:api-${VERSION}"