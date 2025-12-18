#!/bin/bash
# Media Project Manager - Development Start Script (Mac/Linux)
# Usage: ./scripts/dev.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}   🚀 Media Project Manager - Development Mode${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 node_modules not found. Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Check for updates in package.json
echo -e "${GREEN}📦 Checking dependencies...${NC}"
npm list --depth=0 > /dev/null 2>&1 || {
    echo -e "${YELLOW}⚠️  Dependencies out of sync. Running npm install...${NC}"
    npm install
    echo ""
}

# Clean old builds (optional - uncomment if needed)
# echo -e "${GREEN}🧹 Cleaning old builds...${NC}"
# rm -rf dist dist-electron
# echo ""

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo -e "${YELLOW}   Creating from .env.local.example...${NC}"
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✅ .env.local created${NC}"
    else
        echo -e "${RED}❌ .env.local.example not found${NC}"
        echo -e "${YELLOW}   Continuing without .env.local...${NC}"
    fi
    echo ""
fi

# Display info
echo -e "${GREEN}🔥 Starting Electron App...${NC}"
echo -e "${YELLOW}   Press Ctrl+C to stop${NC}"
echo -e "${YELLOW}   Vite Dev Server: http://localhost:5173${NC}"
echo ""
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Start the app
npm run electron:dev
