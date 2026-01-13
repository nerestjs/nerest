#!/bin/sh

# Get the directory where this script is located
get_script_dir() {
  echo "$(cd "$(dirname "$0")" && pwd)"
}

# Install dependencies in harness directory
install_dependencies() {
  HARNESS_DIR="$1"
  echo "Installing harness dependencies..."
  cd "$HARNESS_DIR"
  npm install
}

# Wait for server to be ready
wait_for_server() {
  LOG_FILE="$1"
  TIMEOUT="${2:-30}"

  echo "Waiting for server to be ready..."
  SECONDS=0
  while [ $SECONDS -lt "$TIMEOUT" ]; do
    if grep -q "Server listening at http://127.0.0.1:3000" "$LOG_FILE" 2>/dev/null; then
      return 0
    fi
    sleep 1
    SECONDS=$((SECONDS + 1))
  done

  echo "Server failed to start within $TIMEOUT seconds"
  cat "$LOG_FILE"
  return 1
}

# Setup cleanup trap for server process
setup_cleanup() {
  cleanup() {
    if [ -n "$SERVER_PID" ]; then
      kill "$SERVER_PID" 2>/dev/null || true
    fi
  }
  trap cleanup EXIT INT TERM
}
