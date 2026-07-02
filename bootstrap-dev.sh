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

if [[ -f "${ROOT}/scripts/sandboxer-config.py" ]]; then
  python3 "${ROOT}/scripts/sandboxer-config.py" ensure "${ROOT}" 2>/dev/null || true
fi

if [[ ! -x "${ROOT}/.engine/sandboxer" && -f "${ROOT}/.engine/sandboxer" ]]; then
  chmod +x "${ROOT}/.engine/sandboxer" 2>/dev/null || true
fi

echo ""
echo "bootstrap-dev: OK"
echo "  Canonical path: ${ROOT}"
echo "  Next: ./prompter update && ./prompter"
echo "  Tip: use ~/work/personal/BarberShop (not ~/workspace — that path is not set up)"
