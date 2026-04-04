#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# AEGIS - Cyber Attribution Engine - Run Full Stack (Mac/Linux)
# ══════════════════════════════════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     AEGIS - Cyber-Infrastructure Attribution Engine          ║"
echo "║     Graph Intelligence + Behavioral Fingerprinting           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python not found. Please install Python 3.10+${NC}"
    exit 1
fi

# Check Node
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Start Backend
echo -e "${BLUE}[1/2] Starting Backend (FastAPI on port 8000)...${NC}"
cd backend
python3 -m venv venv 2>/dev/null
source venv/bin/activate
pip install -r requirements.txt -q
echo -e "${GREEN}[BACKEND] Server starting...${NC}"
uvicorn app:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "     Waiting for backend to initialize..."
sleep 5

# Start Frontend
echo -e "${BLUE}[2/2] Starting Frontend (Next.js on port 3000)...${NC}"
cd frontend
npm install --silent
echo -e "${GREEN}[FRONTEND] Server starting...${NC}"
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  AEGIS is starting up...                                     ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "  Backend:   ${GREEN}http://127.0.0.1:8000${NC}"
echo -e "  API Docs:  ${GREEN}http://127.0.0.1:8000/docs${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "  ${YELLOW}Pages:${NC}"
echo -e "    /           - Dashboard Overview"
echo -e "    /graph      - Network Graph Visualization"
echo -e "    /attribution - Command Node Analysis"
echo -e "    /fingerprints - Behavioral Patterns"
echo -e "    /analytics  - Charts & Statistics"
echo -e "    /alerts     - Alert Log Table"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for Ctrl+C
trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
