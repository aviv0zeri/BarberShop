#!/usr/bin/env bash
# Run all GateOpen docker smokes (stack should already be up for verify mode).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DIR="${ROOT}/tests/smoke"
# shellcheck source=tests/smoke/_lib.sh
source "${DIR}/_lib.sh"

smoke_require_docker

echo "GateOpen smoke tests — ${ROOT}"

FAILED=0
RUN=(
  guests
  auth-mongo
  crypto
  invites
  whatsapp
)

for name in "${RUN[@]}"; do
  script="${DIR}/${name}.sh"
  if [[ ! -x "${script}" ]]; then
    smoke_fail "missing ${script}"
    FAILED=1
    continue
  fi
  if ! "${script}"; then
    FAILED=1
    if [[ "${SMOKE_CONTINUE:-}" != 1 ]]; then
      echo ""
      echo "smoke: stopped after ${name} (set SMOKE_CONTINUE=1 to run all)" >&2
      exit 1
    fi
  fi
done

echo ""
if (( FAILED )); then
  echo "smoke: FAILED" >&2
  exit 1
fi
echo "smoke: all passed"
exit 0
