#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}" || exit 1

TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
LOG_DIR="${REPO_ROOT}/tmp/prompt-runs/${TIMESTAMP}"
CLAUDE_TIMEOUT_SECONDS="${CLAUDE_TIMEOUT_SECONDS:-600}"

PROMPT_FILES=(
  "${REPO_ROOT}/speech-to-text/minimal/PROMPT.md"
  "${REPO_ROOT}/text-to-speech/minimal/PROMPT.md"
)

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

echo "Preparing prompt runner..."
require_cmd "npx"
require_cmd "claude"
require_cmd "perl"

for prompt_file in "${PROMPT_FILES[@]}"; do
  if [[ ! -f "${prompt_file}" ]]; then
    echo "Prompt file not found: ${prompt_file}" >&2
    exit 1
  fi
  if [[ ! -s "${prompt_file}" ]]; then
    echo "Prompt file is empty: ${prompt_file}" >&2
    exit 1
  fi
done

mkdir -p "${LOG_DIR}"
echo "Logs: ${LOG_DIR}"

echo
echo "Step 1/2: Pulling latest skills"
npx skills add elevenlabs/skills -y 2>&1 | tee "${LOG_DIR}/skills-add.log"
SKILLS_EXIT=${PIPESTATUS[0]}
printf "exit_code=%s\n" "${SKILLS_EXIT}" >> "${LOG_DIR}/skills-add.log"
if [[ ${SKILLS_EXIT} -ne 0 ]]; then
  echo "Skills install failed. See ${LOG_DIR}/skills-add.log" >&2
  exit "${SKILLS_EXIT}"
fi

echo
echo "Step 2/2: Running prompts with fresh Claude processes"
echo "Claude timeout per prompt: ${CLAUDE_TIMEOUT_SECONDS}s"
FAILED_RUNS=0

for prompt_file in "${PROMPT_FILES[@]}"; do
  project_dir="$(dirname "${prompt_file}")"
  relative_project_dir="${project_dir#${REPO_ROOT}/}"
  log_name="${relative_project_dir//\//__}.log"
  run_log="${LOG_DIR}/${log_name}"

  echo
  echo "Running: ${relative_project_dir}/PROMPT.md"
  (
    cd "${project_dir}" || exit 1
    perl -e 'alarm shift @ARGV; exec @ARGV' \
      "${CLAUDE_TIMEOUT_SECONDS}" \
      claude -p "$(cat "PROMPT.md")"
  ) 2>&1 | tee "${run_log}"
  RUN_EXIT=${PIPESTATUS[0]}
  printf "exit_code=%s\n" "${RUN_EXIT}" >> "${run_log}"

  if [[ ${RUN_EXIT} -ne 0 ]]; then
    FAILED_RUNS=$((FAILED_RUNS + 1))
    echo "Failed: ${relative_project_dir} (see ${run_log})" >&2
  else
    echo "Completed: ${relative_project_dir}"
  fi
done

echo
if [[ ${FAILED_RUNS} -ne 0 ]]; then
  echo "${FAILED_RUNS} prompt run(s) failed. Logs: ${LOG_DIR}" >&2
  exit 1
fi

echo "All prompt runs completed successfully. Logs: ${LOG_DIR}"
