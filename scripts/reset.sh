#!/bin/bash
# Media Project Manager - Reset Script (Mac/Linux)
# Cleans all build artifacts and reinstalls dependencies

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}⚠️  This will delete all build artifacts and reinstall dependencies${NC}"
read -p "Are you sure? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🧹 Cleaning build artifacts...${NC}"
rm -rf dist dist-electron node_modules/.vite
echo -e "${GREEN}✅ Build artifacts cleaned${NC}"

echo ""
echo -e "${YELLOW}📦 Reinstalling dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo -e "${GREEN}🎉 Reset complete! Run ./scripts/dev.sh to start${NC}"
echo ""
