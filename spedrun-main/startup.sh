#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is required. Install Node.js 20 or newer, then retry."
    exit 1
fi

if [[ ! -d node_modules ]]; then
    echo "Installing npm dependencies..."
    npm install
fi

if [[ ! -f .env ]]; then
    cp .env.example .env
    echo ".env created from .env.example. Fill in the required secrets, then run ./startup.sh again."
    exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

node scripts/checkWebsiteSetup.js

cleanup() {
    if [[ -n "${BOT_PID:-}" ]]; then kill "$BOT_PID" 2>/dev/null || true; fi
    if [[ -n "${WEB_PID:-}" ]]; then kill "$WEB_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT INT TERM

echo "Starting Hielke AI website on port ${WEB_PORT:-3001}..."
node webServer.js &
WEB_PID=$!

if [[ -f index.js && -n "${DISCORD_TOKEN:-}" ]]; then
    echo "Starting Discord bot..."
    node index.js &
    BOT_PID=$!
fi

wait -n "$WEB_PID" ${BOT_PID:+$BOT_PID}
