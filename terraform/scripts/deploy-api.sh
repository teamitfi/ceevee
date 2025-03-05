#!/bin/bash

set -euo pipefail

# Configuration
PROJECT_ID=${PROJECT_ID:-"ai-tools-452306"}
REGION=${REGION:-"europe-north1"}
REPOSITORY="ceevee"
IMAGE="api"
VERSION=$(git rev-parse --short HEAD)
REGISTRY_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}"

# Ensure we're in the right directory (repository root)
cd "$(git rev-parse --show-toplevel)"

echo "🔐 Authenticating with Google Cloud..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Create Artifact Registry repository if it doesn't exist
if ! gcloud artifacts repositories describe ${REPOSITORY} --location=${REGION} &>/dev/null; then
    echo "🏗️  Creating Artifact Registry repository..."
    gcloud artifacts repositories create ${REPOSITORY} \
        --repository-format=docker \
        --location=${REGION} \
        --description="Ceevee container repository"
fi

echo "🏗️  Building API image..."
docker build -t ${IMAGE}:latest ./api

echo "🏷️  Tagging images..."
docker tag ${IMAGE}:latest ${REGISTRY_PATH}/${IMAGE}:latest
docker tag ${IMAGE}:latest ${REGISTRY_PATH}/${IMAGE}:${VERSION}

echo "⬆️  Pushing images to Artifact Registry..."
docker push ${REGISTRY_PATH}/${IMAGE}:latest
docker push ${REGISTRY_PATH}/${IMAGE}:${VERSION}

echo "✅ Successfully pushed images:"
echo "   - ${REGISTRY_PATH}/${IMAGE}:latest"
echo "   - ${REGISTRY_PATH}/${IMAGE}:${VERSION}"