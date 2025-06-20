#!/bin/bash
set -e

# Capture version argument
VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❗ Error: You must provide a version. Example: bash deploy.sh v1.0.0"
  exit 1
fi

# Get short Git commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)

# Docker Hub username
DOCKER_USERNAME=ejposadas

# Function to push with retries
push_with_retry() {
  local image=$1
  local tag=$2
  local retries=3
  local count=0
  
  while [ $count -lt $retries ]; do
    echo "Pushing $image:$tag (attempt $((count+1))/$retries)"
    if docker push "$image:$tag"; then
      return 0
    fi
    count=$((count+1))
    sleep 5
  done
  
  echo "❌ Failed to push $image:$tag after $retries attempts"
  return 1
}

# Build Docker images (always pulling latest base images)
echo "Building images..."
docker compose build --pull

# Tag backend
echo "Tagging backend..."
docker tag $DOCKER_USERNAME/mecoapp-backend $DOCKER_USERNAME/mecoapp-backend:$COMMIT_HASH
docker tag $DOCKER_USERNAME/mecoapp-backend $DOCKER_USERNAME/mecoapp-backend:latest
docker tag $DOCKER_USERNAME/mecoapp-backend $DOCKER_USERNAME/mecoapp-backend:$VERSION

# Tag frontend
echo "Tagging frontend..."
docker tag $DOCKER_USERNAME/mecoapp-frontend $DOCKER_USERNAME/mecoapp-frontend:$COMMIT_HASH
docker tag $DOCKER_USERNAME/mecoapp-frontend $DOCKER_USERNAME/mecoapp-frontend:latest
docker tag $DOCKER_USERNAME/mecoapp-frontend $DOCKER_USERNAME/mecoapp-frontend:$VERSION

# Push images with error handling
echo "Pushing images..."
push_with_retry $DOCKER_USERNAME/mecoapp-backend $COMMIT_HASH
push_with_retry $DOCKER_USERNAME/mecoapp-backend latest
push_with_retry $DOCKER_USERNAME/mecoapp-backend $VERSION
push_with_retry $DOCKER_USERNAME/mecoapp-frontend $COMMIT_HASH
push_with_retry $DOCKER_USERNAME/mecoapp-frontend latest
push_with_retry $DOCKER_USERNAME/mecoapp-frontend $VERSION

# Success message
echo "✅ Successfully built, tagged, and pushed images:"
echo "Backend:"
echo "  - $DOCKER_USERNAME/mecoapp-backend:$COMMIT_HASH"
echo "  - $DOCKER_USERNAME/mecoapp-backend:latest"
echo "  - $DOCKER_USERNAME/mecoapp-backend:$VERSION"
echo "Frontend:"
echo "  - $DOCKER_USERNAME/mecoapp-frontend:$COMMIT_HASH"
echo "  - $DOCKER_USERNAME/mecoapp-frontend:latest"
echo "  - $DOCKER_USERNAME/mecoapp-frontend:$VERSION"