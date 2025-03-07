#!/bin/bash

set -euo pipefail

# Configuration
PROJECT_ID=${PROJECT_ID:-"ai-tools-452306"}
REGION=${REGION:-"europe-north1"}
REPOSITORY="ai-tools-dev"
IMAGE="api"
VERSION=$(git rev-parse --short HEAD)
REGISTRY_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}"

# Ensure we're in the right directory (repository root)
cd "$(git rev-parse --show-toplevel)"

echo "🔐 Authenticating with Google Cloud..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

echo "🏗️  Building API image..."
docker build -t ${IMAGE}:${VERSION} api/

echo "🏷️  Tagging image..."
docker tag ${IMAGE}:${VERSION} ${REGISTRY_PATH}/${IMAGE}:${VERSION}

echo "⬆️  Pushing image to Artifact Registry..."
docker push ${REGISTRY_PATH}/${IMAGE}:${VERSION}

echo "✅ Successfully pushed image:"
echo "   - ${REGISTRY_PATH}/${IMAGE}:${VERSION}"
