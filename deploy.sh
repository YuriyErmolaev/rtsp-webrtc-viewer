#!/bin/bash

# Deploy script for RTSP to WebRTC Viewer

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker compose is available (try both v2 and v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi

# Step 1: Build Angular frontend
echo -e "${YELLOW}📦 Building Angular frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing npm dependencies...${NC}"
    npm install
fi

echo -e "${YELLOW}🔨 Building production bundle...${NC}"
npm run build

cd ..

# Check if build was successful
if [ ! -f "frontend/dist/rtsp-webrtc-viewer/browser/index.html" ]; then
    echo -e "${RED}❌ Build failed. Please check the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build completed successfully!${NC}"

# Step 2: Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
$DOCKER_COMPOSE down

# Step 3: Start Docker containers
echo -e "${YELLOW}🐳 Starting Docker containers...${NC}"
$DOCKER_COMPOSE up -d

# Wait for containers to be healthy
echo -e "${YELLOW}⏳ Waiting for containers to start...${NC}"
sleep 5

# Check container status
if $DOCKER_COMPOSE ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Containers started successfully!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Deployment completed!${NC}"
    echo ""
    echo "📍 Access points:"
    echo "   - Angular UI:     http://localhost:8080"
    echo "   - Go2RTC Web UI:  http://localhost:1984"
    echo "   - TURN Server:    localhost:3480"
    echo ""
    echo "📝 View logs:"
    echo "   $DOCKER_COMPOSE logs -f"
    echo ""
    echo "🛑 Stop containers:"
    echo "   $DOCKER_COMPOSE down"
else
    echo -e "${RED}❌ Some containers failed to start. Check logs with: $DOCKER_COMPOSE logs${NC}"
    exit 1
fi
