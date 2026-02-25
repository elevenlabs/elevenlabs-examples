#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}" || exit 1

if [[ $# -gt 1 ]]; then
  echo "Usage: $0 [folder-or-PROMPT.md]" >&2
  exit 1
fi

TARGET_PATH="${1:-}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
LOG_DIR="${REPO_ROOT}/tmp/prompt-runs/${TIMESTAMP}"
CLAUDE_TIMEOUT_SECONDS="${CLAUDE_TIMEOUT_SECONDS:-600}"

expected_outputs_for_project() {
  case "$1" in
    "speech-to-text/minimal")
      printf "%s\n" "package.json" ".env.example" "index.ts" "README.md"
      ;;
    "text-to-speech/minimal")
      printf "%s\n" "package.json" ".env.example" "index.ts" "README.md"
      ;;
    *)
      printf "%s\n" ""
      ;;
  esac
}

PROMPT_FILES=()
if [[ -n "${TARGET_PATH}" ]]; then
  if [[ -d "${TARGET_PATH}" ]]; then
    TARGET_PATH="${TARGET_PATH%/}/PROMPT.md"
  fi

  if [[ ! -f "${TARGET_PATH}" ]]; then
    echo "Target not found: ${1}" >&2
    echo "Pass a folder containing PROMPT.md or a direct path to PROMPT.md." >&2
    exit 1
  fi

  if [[ "$(basename "${TARGET_PATH}")" != "PROMPT.md" ]]; then
    echo "Target must be a folder containing PROMPT.md or a PROMPT.md file: ${1}" >&2
    exit 1
  fi

  target_dir_abs="$(cd "$(dirname "${TARGET_PATH}")" && pwd)"
  PROMPT_FILES+=("${target_dir_abs}/PROMPT.md")
else
  while IFS= read -r prompt_file; do
    PROMPT_FILES+=("${prompt_file}")
  done < <(find "${REPO_ROOT}" -type f -name "PROMPT.md" \
    -not -path "${REPO_ROOT}/.git/*" \
    -not -path "*/node_modules/*" | sort)
fi

if [[ ${#PROMPT_FILES[@]} -eq 0 ]]; then
  echo "No PROMPT.md files found under ${REPO_ROOT}" >&2
  exit 1
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

echo "Preparing prompt runner..."
require_cmd "pnpm"
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

if [[ -n "${TARGET_PATH}" ]]; then
  selected_dir="$(dirname "${PROMPT_FILES[0]}")"
  relative_selected_dir="${selected_dir#${REPO_ROOT}/}"
  echo "Target: ${relative_selected_dir}"
fi

echo
echo "Step 1/2: Pulling latest skills"
pnpm dlx skills add elevenlabs/skills --agent claude-code -y 2>&1 | tee "${LOG_DIR}/skills-add.log"
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
      claude --dangerously-skip-permissions -p "$(cat "PROMPT.md")"
  ) 2>&1 | tee "${run_log}"
  RUN_EXIT=${PIPESTATUS[0]}
  printf "exit_code=%s\n" "${RUN_EXIT}" >> "${run_log}"

  if [[ ${RUN_EXIT} -ne 0 ]]; then
    FAILED_RUNS=$((FAILED_RUNS + 1))
    echo "Failed: ${relative_project_dir} (see ${run_log})" >&2
  else
    missing_count=0
    while IFS= read -r output_file; do
      [[ -z "${output_file}" ]] && continue
      if [[ ! -f "${project_dir}/${output_file}" ]]; then
        missing_count=$((missing_count + 1))
        echo "Missing expected file: ${relative_project_dir}/${output_file}" >&2
      fi
    done < <(expected_outputs_for_project "${relative_project_dir}")

    if [[ ${missing_count} -ne 0 ]]; then
      FAILED_RUNS=$((FAILED_RUNS + 1))
      echo "Failed: ${relative_project_dir} (no generated output detected; see ${run_log})" >&2
    else
      echo "Completed: ${relative_project_dir}"
    fi
  fi
done

echo
if [[ ${FAILED_RUNS} -ne 0 ]]; then
  echo "${FAILED_RUNS} prompt run(s) failed. Logs: ${LOG_DIR}" >&2
  exit 1
fi

echo "All prompt runs completed successfully. Logs: ${LOG_DIR}"
