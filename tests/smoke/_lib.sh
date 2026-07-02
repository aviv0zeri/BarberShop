#!/usr/bin/env bash
# Shared helpers for tests/smoke/*.sh (source, do not execute directly).
set -euo pipefail

smoke_repo_root() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd
}

smoke_require_docker() {
  command -v docker >/dev/null 2>&1 || {
    echo "smoke: docker not found" >&2
    return 1
  }
}

smoke_wait_url() {
  local url="$1"
  local label="${2:-$url}"
  local tries="${3:-30}"
  local i
  for (( i = 1; i <= tries; i++ )); do
    if curl -sf "${url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "smoke: ${label} not ready (${url})" >&2
  return 1
}

smoke_pass() {
  echo "  ✓ $*"
}

smoke_fail() {
  echo "  ✗ $*" >&2
  return 1
}

smoke_section() {
  echo ""
  echo "==> $*"
}
