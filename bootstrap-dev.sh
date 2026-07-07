#!/usr/bin/env bash
# One-time / repair bootstrap — installs local dev scripts (gitignored) from GateOpen.
# Run after clone: ./bootstrap-dev.sh && ./prompter update
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATEOPEN="${GATEOPEN_ROOT:-${HOME}/work/personal/GateOpen}"
INSTALL_SRC="${GATEOPEN}/scripts/setupp-prompter-install.sh"

if [[ ! -f "${INSTALL_SRC}" ]]; then
  echo "Missing GateOpen at ${GATEOPEN}" >&2
  echo "Set GATEOPEN_ROOT or clone GateOpen to ~/work/personal/GateOpen" >&2
  exit 1
fi

mkdir -p "${ROOT}/scripts" "${ROOT}/.engine/prompter"
cp "${INSTALL_SRC}" "${ROOT}/scripts/setupp-prompter-install.sh"
SETUPP_PROMPTER_SRC="${GATEOPEN}/scripts" bash "${ROOT}/scripts/setupp-prompter-install.sh" "${ROOT}"

if [[ -f "${ROOT}/dev/local-dev.sh" ]]; then
  cp "${ROOT}/dev/local-dev.sh" "${ROOT}/scripts/local-dev.sh"
  chmod +x "${ROOT}/scripts/local-dev.sh"
fi

if [[ -f "${ROOT}/scripts/sandboxer-config.py" ]]; then
  python3 "${ROOT}/scripts/sandboxer-config.py" ensure "${ROOT}" 2>/dev/null || true
fi

if [[ ! -x "${ROOT}/.engine/sandboxer" && -f "${ROOT}/.engine/sandboxer" ]]; then
  chmod +x "${ROOT}/.engine/sandboxer" 2>/dev/null || true
fi

chmod +x "${ROOT}/open-app" "${ROOT}/prompter-snapshot" "${ROOT}/prompter" 2>/dev/null || true

echo ""
echo "bootstrap-dev: OK"
echo "  Path: ${ROOT}"
echo "  Next: ./prompter update && ./prompter"
echo ""
echo "  Menu test: ./prompter-snapshot"
echo ""
if [[ -d "${HOME}/workspace" && ! -L "${HOME}/workspace" ]]; then
  echo "  NOTE: ~/workspace is a real folder (not a symlink)."
  echo "  To alias it to ~/work, run FROM HOME (not inside workspace):"
  echo "    cd ~ && mv workspace workspace.bak && ln -sf work workspace"
fi
