#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HARNESS_DIR="$SCRIPT_DIR/harness"

# Load utilities
. "$SCRIPT_DIR/utils.sh"

# Setup cleanup
setup_cleanup

# Install dependencies
install_dependencies "$HARNESS_DIR"

# Start dev server
echo "Starting development server..."
ENABLE_K8S_PROBES=true npm run watch > /tmp/nerest-dev-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
wait_for_server /tmp/nerest-dev-server.log 30

# Run tests
echo "Running integration tests..."
cd "$SCRIPT_DIR/../.."
npx vitest run tests/integration/suites/
