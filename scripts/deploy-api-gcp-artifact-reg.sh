#!/bin/bash

set -euo pipefail

# Configuration
PROJECT_ID=${PROJECT_ID:-"ai-tools-452306"}
REGION=${REGION:-"europe-north1"}
REPOSITORY="ai-tools-dev"
API_IMAGE="api"
UI_IMAGE="ui"
VERSION=$(git rev-parse --short HEAD)
REGISTRY_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}"

# Ensure we're in the right directory (repository root)
cd "$(git rev-parse --show-toplevel)"

echo "🔐 Authenticating with Google Cloud..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

echo "🏗️  Building API image..."
docker build -t ${API_IMAGE}:${VERSION} api/

echo "🏗️  Building UI image..."
docker build -t ${UI_IMAGE}:${VERSION} ui/

echo "🏷️  Tagging images..."
docker tag ${API_IMAGE}:${VERSION} ${REGISTRY_PATH}/${API_IMAGE}:${VERSION}
docker tag ${API_IMAGE}:${VERSION} ${REGISTRY_PATH}/${API_IMAGE}:latest
docker tag ${UI_IMAGE}:${VERSION} ${REGISTRY_PATH}/${UI_IMAGE}:${VERSION}
docker tag ${UI_IMAGE}:${VERSION} ${REGISTRY_PATH}/${UI_IMAGE}:latest

echo "⬆️  Pushing images to Artifact Registry..."
docker push ${REGISTRY_PATH}/${API_IMAGE}:${VERSION}
docker push ${REGISTRY_PATH}/${API_IMAGE}:latest
docker push ${REGISTRY_PATH}/${UI_IMAGE}:${VERSION}
docker push ${REGISTRY_PATH}/${UI_IMAGE}:latest

echo "✅ Successfully pushed images:"
echo "   - ${REGISTRY_PATH}/${API_IMAGE}:${VERSION}"
echo "   - ${REGISTRY_PATH}/${UI_IMAGE}:${VERSION}"