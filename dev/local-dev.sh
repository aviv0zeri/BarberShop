#!/usr/bin/env bash
# BarberShop — local dev helpers (Expo mobile; API stack TBD).
# Tracked copy — bootstrap-dev.sh installs to scripts/local-dev.sh
# Prototype phase: Expo Go (--go). Switch to --dev-client after `expo run:ios`.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_ENGINE_DIR="${REPO_ROOT}/.engine"
_DEV_DIR="${_ENGINE_DIR}/barbershop-dev"
mkdir -p "${_ENGINE_DIR}/prompter" "${_DEV_DIR}" 2>/dev/null || true

_barbershop_load_root_env() {
  if [[ -f "${REPO_ROOT}/.engine/.env" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "${REPO_ROOT}/.engine/.env" 2>/dev/null || true
    set +a
  fi
}

_barbershop_require_permission() {
  [[ "${GATEOPEN_PERMISSION_SKIP:-}" == 1 ]] && return 0
  local py="${REPO_ROOT}/scripts/permission-gate.py"
  [[ -f "${py}" ]] || return 0
  _barbershop_load_root_env
  if python3 "${py}" status "${REPO_ROOT}" >/dev/null 2>&1; then
    return 0
  fi
  echo "BarberShop locked — permission key missing or invalid." >&2
  echo "  Author: python3 scripts/permission-gate.py generate ." >&2
  echo "  Teammate: ask author for key, then prompter → Permission key — unlock" >&2
  echo "  CI only: GATEOPEN_PERMISSION_SKIP=1" >&2
  return 1
}

_barbershop_load_root_env

BARBER_APP="${BARBER_APP:-BarberShopCustomer}"
_SANDBOXER_CFG="${REPO_ROOT}/.engine/sandboxer.config.json"
_EXPO_METRO_PY="${REPO_ROOT}/scripts/expo_metro_port.py"
_CUSTOMER_APP="BarberShopCustomer"

_barbershop_resolve_app_paths() {
  local app="${BARBER_APP}"
  local front="" back=""
  if [[ -f "${_SANDBOXER_CFG}" ]]; then
  # shellcheck disable=SC2046
    eval "$(python3 - "${_SANDBOXER_CFG}" "${app}" <<'PY'
import json, sys
cfg_path, app = sys.argv[1], sys.argv[2]
try:
    doc = json.loads(open(cfg_path, encoding="utf-8").read())
    mobile = doc.get("mobile") or {}
    apps = mobile.get("apps") or {}
    entry = apps.get(app) or {}
    if not entry.get("front") and entry.get("alias_of"):
        entry = apps.get(entry["alias_of"]) or entry
    if not entry.get("front"):
        entry = apps.get(mobile.get("default_app") or "") or entry
    front = entry.get("front") or f"beta/apps/{app}/front"
    back = entry.get("back") or f"beta/apps/{app}/back"
    port = entry.get("metro_port") or 8082
except (OSError, json.JSONDecodeError, KeyError):
    front = f"beta/apps/{app}/front"
    back = f"beta/apps/{app}/back"
    port = 8082
print(f'front="{front}"')
print(f'back="{back}"')
print(f'metro_port="{port}"')
PY
)"
  else
    front="beta/apps/${app}/front"
    back="beta/apps/${app}/back"
    metro_port="8082"
  fi
  FRONT="${REPO_ROOT}/${front}"
  BACK="${REPO_ROOT}/${back}"
  if [[ -z "${BARBER_METRO_PORT:-}" ]]; then
    METRO_PORT="${metro_port}"
  else
    METRO_PORT="${BARBER_METRO_PORT}"
  fi
  export BARBER_METRO_PORT="${METRO_PORT}"
}

_barbershop_resolve_app_paths

METRO_PID="${_DEV_DIR}/metro.pid"
EXPO_MODE="${BARBER_EXPO_MODE:-go}"

_resolve_front() {
  echo "${FRONT}"
}

_metro_resolve_port() {
  if [[ -f "${_EXPO_METRO_PY}" ]]; then
    local resolved
    resolved="$(python3 "${_EXPO_METRO_PY}" resolve "${REPO_ROOT}" --for-start --app "${BARBER_APP}" 2>/dev/null || true)"
    if [[ "${resolved}" =~ ^[0-9]+$ ]]; then
      METRO_PORT="${resolved}"
      export BARBER_METRO_PORT="${METRO_PORT}"
    fi
  fi
}

_metro_listening() {
  lsof -nP -iTCP:"${METRO_PORT}" -sTCP:LISTEN >/dev/null 2>&1
}

_metro_pids_on_port() {
  lsof -tiTCP:"${METRO_PORT}" -sTCP:LISTEN 2>/dev/null || true
}

_metro_pid_args() {
  ps -p "$1" -o args= 2>/dev/null || true
}

_metro_pid_cwd() {
  local line cwd=""
  while IFS= read -r line; do
    [[ "${line}" == n* ]] && cwd="${line#n}"
  done < <(lsof -a -p "$1" -d cwd -Fn 2>/dev/null || true)
  echo "${cwd}"
}

_metro_pid_is_repo_metro() {
  local pid="$1" args cwd
  args="$(_metro_pid_args "${pid}")"
  cwd="$(_metro_pid_cwd "${pid}")"
  [[ -n "${args}" ]] || return 1
  [[ "${args}" == *"expo"* || "${args}" == *"@expo/cli"* ]] || return 1
  [[ "${cwd}" == "${REPO_ROOT}/beta/apps/BarberShop/front" ]] && return 0
  [[ "${cwd}" == "${REPO_ROOT}/beta/apps/BarberShopCustomer/front" ]] && return 0
  [[ "${cwd}" == "${FRONT}" ]] && return 0
  [[ "${args}" == *"${REPO_ROOT}/beta/apps/BarberShop/front"* ]] && return 0
  [[ "${args}" == *"${REPO_ROOT}/beta/apps/BarberShopCustomer/front"* ]] && return 0
  [[ "${args}" == *"${FRONT}"* ]] && return 0
  return 1
}

_metro_pid_is_gateopen_metro() {
  local pid="$1" args cwd root
  args="$(_metro_pid_args "${pid}")"
  cwd="$(_metro_pid_cwd "${pid}")"
  [[ -n "${args}" ]] || return 1
  [[ "${args}" == *"expo"* || "${args}" == *"@expo/cli"* ]] || return 1
  for root in "${HOME}/work/personal/GateOpen" "${HOME}/work/GateOpen"; do
    [[ -n "${root}" ]] || continue
    [[ "${cwd}" == "${root}" || "${cwd}" == "${root}/"* ]] && return 0
    [[ "${args}" == *"${root}"* ]] && return 0
  done
  return 1
}

_metro_stop_pid() {
  local pid="$1"
  kill "${pid}" 2>/dev/null || true
  for _ in $(seq 1 20); do
    kill -0 "${pid}" 2>/dev/null || return 0
    sleep 0.1
  done
  kill -TERM "${pid}" 2>/dev/null || true
}

_metro_stop_repo_metro_on_port() {
  local pid stopped=0
  for pid in $(_metro_pids_on_port); do
    if _metro_pid_is_repo_metro "${pid}"; then
      echo "Stopping stale BarberShop Metro pid ${pid} on :${METRO_PORT}" >&2
      _metro_stop_pid "${pid}"
      stopped=1
    fi
  done
  if (( stopped )); then
    rm -f "${METRO_PID}"
    for _ in $(seq 1 30); do
      _metro_listening || return 0
      sleep 0.1
    done
  fi
}

_metro_stop_known_foreign_metro_on_port() {
  local pid stopped=0
  for pid in $(_metro_pids_on_port); do
    if _metro_pid_is_gateopen_metro "${pid}"; then
      echo "Stopping stale GateOpen Metro pid ${pid} on :${METRO_PORT}" >&2
      _metro_stop_pid "${pid}"
      stopped=1
    fi
  done
  if (( stopped )); then
    rm -f "${METRO_PID}"
    for _ in $(seq 1 30); do
      _metro_listening || return 0
      sleep 0.1
    done
  fi
}

_metro_is_ours() {
  [[ -f "${_EXPO_METRO_PY}" ]] || return 1
  python3 "${_EXPO_METRO_PY}" verify "${REPO_ROOT}" --port "${METRO_PORT}" --app "${BARBER_APP}" >/dev/null 2>&1
}

_metro_clear_port_for_app() {
  local try_port cleared=0
  for try_port in "${METRO_PORT}" 8083 8084 8081; do
    METRO_PORT="${try_port}"
    export BARBER_METRO_PORT="${METRO_PORT}"
    _metro_listening || continue
    if _metro_is_ours; then
      _metro_stop_repo_metro_on_port
      cleared=1
      continue
    fi
    _metro_stop_known_foreign_metro_on_port
    _metro_stop_repo_metro_on_port
    cleared=1
  done
  if (( cleared )); then
    _barbershop_resolve_app_paths
    unset BARBER_METRO_PORT
    _metro_resolve_port
  fi
}

_metro_open_simulator() {
  [[ -f "${_EXPO_METRO_PY}" ]] || return 1
  python3 "${_EXPO_METRO_PY}" open-simulator "${REPO_ROOT}" --app "${BARBER_APP}" >/dev/null 2>&1
}

_metro_stop() {
  if [[ -f "${METRO_PID}" ]]; then
    local pid
    pid="$(cat "${METRO_PID}")"
    kill "${pid}" 2>/dev/null || true
    rm -f "${METRO_PID}"
  fi
  for METRO_PORT in 8082 8083 8084; do
    _metro_stop_repo_metro_on_port
    _metro_stop_known_foreign_metro_on_port
  done
  _barbershop_resolve_app_paths
  pkill -f "expo start.*${FRONT}" 2>/dev/null || true
}

_expo_start_args() {
  local clear_arg="${1:-}"
  if [[ "${EXPO_MODE}" == "dev-client" ]]; then
    echo "start --dev-client --localhost --port ${METRO_PORT} ${clear_arg}"
  else
    echo "start --go --localhost --port ${METRO_PORT} ${clear_arg}"
  fi
}

_metro_start_bg() {
  local front args
  front="$(_resolve_front)"
  [[ -f "${front}/package.json" ]] || {
    echo "Missing Expo app: ${front}" >&2
    return 1
  }
  _metro_resolve_port
  if _metro_listening && ! _metro_is_ours; then
    _metro_stop_known_foreign_metro_on_port
  fi
  if _metro_listening && _metro_is_ours; then
    echo "Metro already on :${METRO_PORT} (${BARBER_APP})" >&2
    return 0
  fi
  if _metro_listening && ! _metro_is_ours; then
    echo "Port :${METRO_PORT} is in use by another project; stop that process or set BARBER_METRO_PORT explicitly" >&2
    return 1
  fi
  _metro_stop
  args="$(_expo_start_args)"
  (
    cd "${front}"
    export EXPO_NO_TELEMETRY=1
    unset CI
  # shellcheck disable=SC2086
    npx expo ${args} >>"${_DEV_DIR}/metro.log" 2>&1 &
    echo $! >"${METRO_PID}"
  )
  local waited=0
  until _metro_listening || (( waited >= 30 )); do
    sleep 1
    waited=$((waited + 1))
  done
  if ! _metro_listening; then
    echo "Metro failed to start — see ${_DEV_DIR}/metro.log" >&2
    tail -20 "${_DEV_DIR}/metro.log" 2>/dev/null || true
    return 1
  fi
  echo "Metro → exp://127.0.0.1:${METRO_PORT} (mode: ${EXPO_MODE})" >&2
}

_sim_open() {
  [[ "$(uname -s)" == "Darwin" ]] || return 0
  open -a Simulator 2>/dev/null || true
  sleep 2
}

_sim_wait_booted() {
  [[ "$(uname -s)" == "Darwin" ]] || return 0
  local waited=0
  until xcrun simctl list devices booted 2>/dev/null | grep -q "(Booted)" || (( waited >= 45 )); do
    sleep 1
    waited=$((waited + 1))
  done
  xcrun simctl list devices booted 2>/dev/null | grep -q "(Booted)"
}

cmd_help() {
  cat <<EOF
BarberShop local dev

  beta-compare      Handoff preview (left) + Simulator (right) — compare apps
  beta-compare-stack Metro + Simulator only (used by launch-compare.sh)
  beta-all          Expo Go + Simulator (foreground Metro)
  beta-metro        Metro in background (Expo Go picks it up)
  beta-ios-go       Foreground Metro + open iOS Simulator
  beta-stop         Stop Metro + handoff preview
  beta-iphone       Physical iPhone (LAN / QR or USB dev client)
  beta-iphone-install  One-time USB dev client install
  beta-iphone-update   Rebuild + reinstall on USB iPhone
  beta-iphone-preflight  Mac + stack checks (--fix)
  beta-android      Physical Android USB test
  beta-android-install  One-time USB dev client install
  beta-android-update   Rebuild + reinstall on USB Android
  beta-android-preflight  USB + stack checks (--fix)

  BARBER_APP=${BARBER_APP}  BARBER_METRO_PORT=${METRO_PORT}
  BARBER_EXPO_MODE=${EXPO_MODE}  (go | dev-client)

EOF
}

cmd_beta_metro() {
  _barbershop_require_permission || return 1
  _metro_start_bg
}

cmd_beta_ios_go() {
  _barbershop_require_permission || return 1
  local front args
  front="$(_resolve_front)"
  _metro_resolve_port
  _sim_open
  _metro_stop
  args="$(_expo_start_args)"
  (
    cd "${front}"
    export EXPO_NO_TELEMETRY=1
    export BARBER_METRO_PORT="${METRO_PORT}"
  # shellcheck disable=SC2086
    exec npx expo ${args} --ios
  )
}

cmd_beta_all() {
  _barbershop_require_permission || return 1
  echo "BarberShop — starting Expo Go on Simulator…" >&2
  cmd_beta_ios_go
}

_handoff_preview_stop() {
  local compose="${REPO_ROOT}/docker/handoff-preview/compose.yml"
  local pidfile="${_DEV_DIR}/handoff-preview.pid"
  if [[ -f "${pidfile}" ]]; then
    local hp
    hp="$(cat "${pidfile}")"
    kill "${hp}" 2>/dev/null || true
    rm -f "${pidfile}"
  fi
  if [[ -f "${compose}" ]] && command -v docker >/dev/null 2>&1; then
    docker compose -f "${compose}" down >/dev/null 2>&1 || true
  fi
}

cmd_beta_compare_stack() {
  _barbershop_require_permission || return 1
  local front args expo_log
  BARBER_APP="${_CUSTOMER_APP}"
  export BARBER_APP
  unset BARBER_METRO_PORT
  _barbershop_resolve_app_paths
  front="$(_resolve_front)"
  expo_log="${_DEV_DIR}/expo-ios.log"
  _metro_resolve_port
  if _metro_listening; then
    if _metro_is_ours; then
      echo "Restarting BarberShop Customer Metro on :${METRO_PORT} with a cleared Expo cache" >&2
    else
      echo "Clearing stale Metro on :${METRO_PORT} (GateOpen / legacy BarberShop / foreign Expo)…" >&2
    fi
    _metro_clear_port_for_app
  fi
  _sim_open
  if ! _sim_wait_booted; then
    echo "Warning: Simulator not booted yet — Expo will try to launch a device" >&2
  fi
  if _metro_listening && ! _metro_is_ours; then
    echo "Port :${METRO_PORT} is in use by another project; stop that process or set BARBER_METRO_PORT explicitly" >&2
    return 1
  fi
  _metro_stop
  args="$(_expo_start_args "--clear")"
  : >"${expo_log}"
  (
    cd "${front}"
    export EXPO_NO_TELEMETRY=1
    export BARBER_METRO_PORT="${METRO_PORT}"
    unset CI
  # shellcheck disable=SC2086
    nohup npx expo ${args} --ios >>"${_DEV_DIR}/metro.log" 2>>"${expo_log}" &
    echo $! >"${METRO_PID}"
  )
  local waited=0 metro_ok=0
  until _metro_listening && _metro_is_ours || (( waited >= 90 )); do
    sleep 1
    waited=$((waited + 1))
  done
  if _metro_listening && _metro_is_ours; then
    metro_ok=1
  elif _metro_listening; then
    echo "Warning: Metro is listening on :${METRO_PORT} but app verify is slow — continuing compare" >&2
    metro_ok=1
  fi
  if (( ! metro_ok )); then
    echo "Metro failed to start — see ${_DEV_DIR}/metro.log" >&2
    tail -20 "${_DEV_DIR}/metro.log" 2>/dev/null || true
    [[ -s "${expo_log}" ]] && tail -10 "${expo_log}" >&2 || true
    return 1
  fi
  _metro_open_simulator >>"${expo_log}" 2>&1 || true
  echo "Metro + Simulator → exp://127.0.0.1:${METRO_PORT} (${BARBER_APP})" >&2
}

cmd_beta_compare() {
  _barbershop_require_permission || return 1
  exec bash "${REPO_ROOT}/testersendbox/launch-compare.sh"
}

cmd_beta_stop() {
  echo "Stopping BarberShop dev…" >&2
  _metro_stop
  _handoff_preview_stop
}

cmd_beta_iphone() {
  _barbershop_require_permission || return 1
  exec bash "${SCRIPT_DIR}/sandboxer-iphone.sh" test "$@"
}

cmd_beta_iphone_install() {
  _barbershop_require_permission || return 1
  exec bash "${SCRIPT_DIR}/sandboxer-iphone.sh" install "$@"
}

cmd_beta_iphone_update() {
  _barbershop_require_permission || return 1
  exec bash "${SCRIPT_DIR}/sandboxer-iphone.sh" update "$@"
}

cmd_beta_iphone_preflight() {
  _barbershop_require_permission || return 1
  exec bash "${SCRIPT_DIR}/sandboxer-iphone.sh" preflight "$@"
}

cmd_beta_android() {
  _barbershop_require_permission || return 1
  exec bash "${SCRIPT_DIR}/sandboxer-android.sh" test "$@"
}

cmd_beta_android_install() {
  _barbershop_require_permission || return 1
  exec bash "${SCRIPT_DIR}/sandboxer-android.sh" install "$@"
}

cmd_beta_android_update() {
  _barbershop_require_permission || return 1
  exec bash "${SCRIPT_DIR}/sandboxer-android.sh" update "$@"
}

cmd_beta_android_preflight() {
  _barbershop_require_permission || return 1
  exec bash "${SCRIPT_DIR}/sandboxer-android.sh" preflight "$@"
}

cmd_permission_generate() {
  local py="${REPO_ROOT}/scripts/permission-gate.py"
  [[ -f "${py}" ]] || { echo "Missing ${py}" >&2; return 1; }
  python3 "${py}" generate "${REPO_ROOT}" --author "${GATEOPEN_AUTHOR:-Aviv Ozeri}"
}

cmd_prompter_update() {
  local install="${REPO_ROOT}/scripts/setupp-prompter-install.sh"
  local fallback="${HOME}/work/personal/GateOpen/scripts/setupp-prompter-install.sh"
  [[ -f "${install}" ]] || install="${fallback}"
  [[ -f "${install}" ]] || {
    echo "Missing setupp-prompter-install.sh" >&2
    return 1
  }
  SETUPP_PROMPTER_SRC="${REPO_ROOT}/scripts" bash "${install}" "${REPO_ROOT}"
}

cmd_sandboxer_install() {
  cmd_prompter_update
  local zshrc="${HOME}/.zshrc"
  local mark="GateOpen sandboxer"
  local zsh_src="${HOME}/work/personal/GateOpen/scripts/sandboxer-shell.zsh"
  local prompter_src="${HOME}/work/personal/GateOpen/scripts/prompter-shell.zsh"
  if [[ -f "${zshrc}" ]] && [[ -f "${zsh_src}" ]] && ! grep -q "${mark}" "${zshrc}" 2>/dev/null; then
    {
      echo ""
      echo "# ${mark}"
      echo "source \"${zsh_src}\""
      echo "# GateOpen prompter"
      echo "source \"${prompter_src}\""
    } >>"${zshrc}"
    echo "Added sandboxer + prompter to ~/.zshrc" >&2
  fi
  echo "sandboxer-install: prompter engine synced · run: source ~/.zshrc" >&2
}

main() {
  local cmd="${1:-help}"
  shift || true
  case "${cmd}" in
    help|-h|--help) cmd_help ;;
    beta-compare|compare) cmd_beta_compare "$@" ;;
    beta-compare-stack) cmd_beta_compare_stack "$@" ;;
    beta-all|all) cmd_beta_all "$@" ;;
    beta-metro|metro) cmd_beta_metro "$@" ;;
    beta-metro-stop|beta-stop|stop) cmd_beta_stop "$@" ;;
    beta-ios-go|beta-ios) cmd_beta_ios_go "$@" ;;
    beta-iphone|beta-iphone-test) cmd_beta_iphone "$@" ;;
    beta-iphone-install) cmd_beta_iphone_install "$@" ;;
    beta-iphone-update) cmd_beta_iphone_update "$@" ;;
    beta-iphone-preflight) cmd_beta_iphone_preflight "$@" ;;
    beta-android|beta-android-test) cmd_beta_android "$@" ;;
    beta-android-install) cmd_beta_android_install "$@" ;;
    beta-android-update) cmd_beta_android_update "$@" ;;
    beta-android-preflight) cmd_beta_android_preflight "$@" ;;
    permission-generate) cmd_permission_generate "$@" ;;
    prompter-update) cmd_prompter_update "$@" ;;
    sandboxer-install) cmd_sandboxer_install "$@" ;;
    *)
      echo "Unknown: ${cmd}" >&2
      cmd_help
      return 1
      ;;
  esac
}

main "$@"
