#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HARNESS_DIR="$SCRIPT_DIR/harness"

# Source utilities
. "$SCRIPT_DIR/utils.sh"

# Setup cleanup
setup_cleanup

# Install dependencies
install_dependencies "$HARNESS_DIR"

# Create production build
echo "Creating production build..."
STATIC_PATH=http://127.0.0.1:3000 npm run build

# Start production server
echo "Starting production server..."
ENABLE_K8S_PROBES=true node build/server.mjs > /tmp/nerest-prod-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
wait_for_server /tmp/nerest-prod-server.log 30

# Run tests
echo "Running integration tests..."
cd "$SCRIPT_DIR/../.."
npx vitest run tests/integration/suites/ --exclude tests/integration/suites/browser.test.ts
