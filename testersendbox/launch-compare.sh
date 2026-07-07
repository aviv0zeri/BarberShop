#!/usr/bin/env bash
# Compare apps — client handoff (left) + Expo Simulator (right).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${DIR}/.." && pwd)"
DEV_SH="${ROOT}/scripts/local-dev.sh"
DEV_DIR="${ROOT}/.engine/barbershop-dev"
HANDOFF_PORT="${BARBER_HANDOFF_PORT:-5108}"
export BARBER_APP="BarberShopCustomer"
export BARBER_METRO_PORT="8082"
_HANDOFF_ENTRY_PY="${ROOT}/scripts/handoff_entry.py"
if [[ -f "${_HANDOFF_ENTRY_PY}" ]]; then
  HANDOFF_URL="$(python3 "${_HANDOFF_ENTRY_PY}" "${ROOT}" --url --port "${HANDOFF_PORT}" 2>/dev/null || true)"
fi
HANDOFF_URL="${HANDOFF_URL:-http://127.0.0.1:${HANDOFF_PORT}/Barber%20Booking%20%28Offline%29%20%281%29.html}"
COMPOSE="${ROOT}/docker/handoff-preview/compose.yml"
PIDFILE="${DEV_DIR}/handoff-preview.pid"
LOG="${DEV_DIR}/handoff-preview.log"

mkdir -p "${DEV_DIR}"

_handoff_verify() {
  if curl -sf "${HANDOFF_URL}" >/dev/null 2>&1; then
    echo "→ Handoff verified: ${HANDOFF_URL}" >&2
    return 0
  fi
  echo "Handoff URL not reachable: ${HANDOFF_URL}" >&2
  echo "  See ${LOG}" >&2
  return 1
}

_handoff_up() {
  if curl -sf "${HANDOFF_URL}" >/dev/null 2>&1; then
    echo "→ Handoff preview already on :${HANDOFF_PORT}" >&2
    return 0
  fi
  if [[ -f "${COMPOSE}" ]] && command -v docker >/dev/null 2>&1; then
    echo "→ Starting handoff preview (Docker nginx on :${HANDOFF_PORT})…" >&2
    docker compose -f "${COMPOSE}" up -d >>"${LOG}" 2>&1 || {
      echo "Docker handoff preview failed — compare will use file:// in Opera" >&2
      return 0
    }
    for _ in $(seq 1 40); do
      if curl -sf "${HANDOFF_URL}" >/dev/null 2>&1; then
        return 0
      fi
      sleep 0.25
    done
    echo "Handoff preview did not respond — compare will use file:// in Opera" >&2
    return 0
  fi
  echo "→ Starting handoff preview (Python fallback on :${HANDOFF_PORT})…" >&2
  if [[ -f "${PIDFILE}" ]]; then
    old="$(cat "${PIDFILE}")"
    kill -0 "${old}" 2>/dev/null && kill "${old}" 2>/dev/null || true
    rm -f "${PIDFILE}"
  fi
  nohup python3 "${DIR}/handoff_server.py" --root "${ROOT}/handoff" --port "${HANDOFF_PORT}" >>"${LOG}" 2>&1 &
  echo $! >"${PIDFILE}"
  for _ in $(seq 1 20); do
    if curl -sf "${HANDOFF_URL}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done
  echo "Handoff preview failed — compare will use file:// in Opera" >&2
  return 0
}

echo "BarberShop — compare apps (handoff + Simulator)" >&2
if ! python3 "${ROOT}/scripts/handoff_entry.py" "${ROOT}" >/dev/null 2>&1; then
  echo "Missing handoff Barber Booking.html — import client bundle first:" >&2
  echo "  setupp handoff import <zip|dir> --force" >&2
  exit 1
fi
_handoff_up || true
_handoff_verify || echo "→ Handoff HTTP optional — Opera uses file:// offline bundle" >&2
_compare_stack_rc=0
set +e
bash "${DEV_SH}" beta-compare-stack
_compare_stack_rc=$?
set -e
HANDOFF_FILE="$(python3 "${ROOT}/scripts/handoff_entry.py" "${ROOT}" --file-url 2>/dev/null || true)"
if [[ -z "${HANDOFF_FILE}" ]]; then
  echo "Cannot resolve handoff file:// URL — see scripts/handoff_entry.py" >&2
  exit 1
fi
set +e
bash "${ROOT}/scripts/dual-window-layout.sh" "${HANDOFF_FILE}"
_layout_rc=$?
set -e
if (( _layout_rc != 0 )); then
  echo "→ Window layout best-effort failed (exit ${_layout_rc}) — handoff URL was still opened" >&2
fi
if (( _compare_stack_rc != 0 )); then
  _metro_port="${BARBER_METRO_PORT}"
  if [[ -f "${DEV_DIR}/metro.port" ]]; then
    _metro_port="$(tr -d '[:space:]' <"${DEV_DIR}/metro.port")"
  fi
  if python3 "${ROOT}/scripts/expo_metro_port.py" verify "${ROOT}" --port "${_metro_port}" --app "${BARBER_APP}" >/dev/null 2>&1 \
    || lsof -nP -iTCP:"${_metro_port}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "→ Metro reachable on :${_metro_port} — compare succeeded despite stack warning" >&2
    _compare_stack_rc=0
  else
    echo "Compare stack failed (exit ${_compare_stack_rc}) — see ${DEV_DIR}/metro.log" >&2
    exit "${_compare_stack_rc}"
  fi
fi
echo "" >&2
echo "Left:  ${HANDOFF_FILE}  (Opera GX — client handoff prototype, file://)" >&2
echo "Right: iOS Simulator — Expo app (beta/apps/BarberShopCustomer/front)" >&2
echo "Stop:  scripts/local-dev.sh beta-stop && docker compose -f docker/handoff-preview/compose.yml down" >&2
