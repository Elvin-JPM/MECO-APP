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

# Build Docker images (always pulling latest base images)
docker-compose build --pull

# Tag backend
docker tag $DOCKER_USERNAME/mecoapp-backend $DOCKER_USERNAME/mecoapp-backend:$COMMIT_HASH
docker tag $DOCKER_USERNAME/mecoapp-backend $DOCKER_USERNAME/mecoapp-backend:latest
docker tag $DOCKER_USERNAME/mecoapp-backend $DOCKER_USERNAME/mecoapp-backend:$VERSION

# Tag frontend
docker tag $DOCKER_USERNAME/mecoapp-frontend $DOCKER_USERNAME/mecoapp-frontend:$COMMIT_HASH
docker tag $DOCKER_USERNAME/mecoapp-frontend $DOCKER_USERNAME/mecoapp-frontend:latest
docker tag $DOCKER_USERNAME/mecoapp-frontend $DOCKER_USERNAME/mecoapp-frontend:$VERSION

# Push all tags in parallel
docker push $DOCKER_USERNAME/mecoapp-backend:$COMMIT_HASH &
docker push $DOCKER_USERNAME/mecoapp-backend:latest &
docker push $DOCKER_USERNAME/mecoapp-backend:$VERSION &
docker push $DOCKER_USERNAME/mecoapp-frontend:$COMMIT_HASH &
docker push $DOCKER_USERNAME/mecoapp-frontend:latest &
docker push $DOCKER_USERNAME/mecoapp-frontend:$VERSION &

# Wait for all pushes to complete
wait

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
