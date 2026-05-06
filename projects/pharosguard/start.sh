#!/bin/bash
# PharosGuard — Start Script
# Starts the PharosGuard API server with frontend
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "Starting PharosGuard..."
echo "Chain: Pharos (Chain ID: 1672)"
echo "RPC: https://rpc.pharos.xyz"
echo "Explorer: https://www.pharosscan.xyz"
echo ""

# Check if dependencies are installed
cd "$BACKEND_DIR"
python3 -c "import fastapi" 2>/dev/null || {
    echo "Installing dependencies..."
    pip install --break-system-packages -r requirements.txt
}

echo "Starting server at http://localhost:8000"
echo "Frontend: http://localhost:8000/"
echo "API: http://localhost:8000/api"
echo "Analyze: http://localhost:8000/analyze/0x..."
echo ""

python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
