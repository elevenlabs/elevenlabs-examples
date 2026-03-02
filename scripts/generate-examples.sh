#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}" || exit 1

CLAUDE_TIMEOUT_SECONDS="${CLAUDE_TIMEOUT_SECONDS:-600}"
CLAUDE_MODEL="${CLAUDE_MODEL:-sonnet}"
PROMPT_RUN_OUTPUT="${PROMPT_RUN_OUTPUT:-simple}"

usage() {
  echo "Usage: $0 [-t seconds] [-m model] [-v] [folder-or-PROMPT.md]" >&2
  echo "  -t  Timeout per prompt in seconds (default: 600)" >&2
  echo "  -m  Claude model to use (default: sonnet)" >&2
  echo "  -v  Verbose output" >&2
  exit 1
}

while getopts ":t:m:v" opt; do
  case "${opt}" in
    t) CLAUDE_TIMEOUT_SECONDS="${OPTARG}" ;;
    m) CLAUDE_MODEL="${OPTARG}" ;;
    v) PROMPT_RUN_OUTPUT="verbose" ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))

if [[ $# -gt 1 ]]; then
  usage
fi

TARGET_PATH="${1:-}"

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

is_verbose_output() {
  case "${PROMPT_RUN_OUTPUT}" in
    verbose|full|1|true|TRUE|yes|YES)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

run_with_timeout() {
  local timeout_seconds="$1"
  shift

  "$@" &
  local cmd_pid=$!
  local elapsed=0

  while kill -0 "${cmd_pid}" >/dev/null 2>&1; do
    if (( elapsed >= timeout_seconds )); then
      echo "Command timed out after ${timeout_seconds}s; terminating PID ${cmd_pid}." >&2
      kill -TERM "${cmd_pid}" >/dev/null 2>&1 || true
      sleep 2
      if kill -0 "${cmd_pid}" >/dev/null 2>&1; then
        kill -KILL "${cmd_pid}" >/dev/null 2>&1 || true
      fi
      wait "${cmd_pid}" >/dev/null 2>&1 || true
      return 124
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done

  wait "${cmd_pid}"
}

format_duration() {
  local total_seconds="$1"

  if (( total_seconds < 60 )); then
    printf "%ss" "${total_seconds}"
    return 0
  fi

  local hours=$((total_seconds / 3600))
  local minutes=$(((total_seconds % 3600) / 60))
  local seconds=$((total_seconds % 60))

  if (( hours > 0 )); then
    printf "%dh %dm %ds" "${hours}" "${minutes}" "${seconds}"
  else
    printf "%dm %ds" "${minutes}" "${seconds}"
  fi
}

format_number_with_commas() {
  local number="$1"
  local sign=""
  local formatted=""

  if [[ "${number}" == -* ]]; then
    sign="-"
    number="${number#-}"
  fi

  while [[ ${#number} -gt 3 ]]; do
    formatted=",${number: -3}${formatted}"
    number="${number:0:${#number}-3}"
  done

  printf "%s%s%s" "${sign}" "${number}" "${formatted}"
}

format_token_display() {
  local token_count="$1"
  if [[ -n "${token_count}" && "${token_count}" =~ ^[0-9]+$ ]]; then
    printf "%s tokens" "$(format_number_with_commas "${token_count}")"
  else
    printf "tokens unknown"
  fi
}

extract_json_number_for_keys() {
  local json_text="$1"
  shift
  local flattened_json key value

  flattened_json="$(printf "%s" "${json_text}" | tr -d '\n')"
  for key in "$@"; do
    value="$(printf "%s" "${flattened_json}" | sed -nE "s/.*\"${key}\"[[:space:]]*:[[:space:]]*([0-9]+).*/\\1/p")"
    if [[ -n "${value}" ]]; then
      printf "%s\n" "${value}"
      return 0
    fi
  done
}

extract_with_jq() {
  local json_text="$1"
  local jq_filter="$2"
  local value

  if ! command -v jq >/dev/null 2>&1; then
    return 1
  fi

  value="$(printf "%s" "${json_text}" | jq -r "${jq_filter}" 2>/dev/null || true)"
  if [[ "${value}" == "null" ]]; then
    value=""
  fi
  if [[ -n "${value}" ]]; then
    printf "%s\n" "${value}"
    return 0
  fi

  return 1
}

extract_claude_usage() {
  local output_json="$1"
  local input_for_total=0
  local output_for_total=0
  local cache_write_for_total=0
  local cache_read_for_total=0
  local has_input_tokens=0
  local has_output_tokens=0
  local has_cache_write_tokens=0
  local has_cache_read_tokens=0

  CLAUDE_INPUT_TOKENS=""
  CLAUDE_OUTPUT_TOKENS=""
  CLAUDE_CACHE_WRITE_TOKENS=""
  CLAUDE_CACHE_READ_TOKENS=""
  CLAUDE_TOTAL_TOKENS=""

  CLAUDE_INPUT_TOKENS="$(extract_with_jq "${output_json}" '.usage.input_tokens // .usage.inputTokens // empty')"
  CLAUDE_OUTPUT_TOKENS="$(extract_with_jq "${output_json}" '.usage.output_tokens // .usage.outputTokens // empty')"
  CLAUDE_CACHE_WRITE_TOKENS="$(extract_with_jq "${output_json}" '.usage.cache_creation_input_tokens // .usage.cacheCreationInputTokens // empty')"
  CLAUDE_CACHE_READ_TOKENS="$(extract_with_jq "${output_json}" '.usage.cache_read_input_tokens // .usage.cacheReadInputTokens // empty')"
  CLAUDE_TOTAL_TOKENS="$(extract_with_jq "${output_json}" '.usage.total_tokens // .usage.totalTokens // empty')"

  if [[ -z "${CLAUDE_INPUT_TOKENS}${CLAUDE_OUTPUT_TOKENS}${CLAUDE_CACHE_WRITE_TOKENS}${CLAUDE_CACHE_READ_TOKENS}${CLAUDE_TOTAL_TOKENS}" ]]; then
    CLAUDE_INPUT_TOKENS="$(extract_json_number_for_keys "${output_json}" "input_tokens" "inputTokens")"
    CLAUDE_OUTPUT_TOKENS="$(extract_json_number_for_keys "${output_json}" "output_tokens" "outputTokens")"
    CLAUDE_CACHE_WRITE_TOKENS="$(extract_json_number_for_keys "${output_json}" "cache_creation_input_tokens" "cacheCreationInputTokens")"
    CLAUDE_CACHE_READ_TOKENS="$(extract_json_number_for_keys "${output_json}" "cache_read_input_tokens" "cacheReadInputTokens")"
    CLAUDE_TOTAL_TOKENS="$(extract_json_number_for_keys "${output_json}" "total_tokens" "totalTokens")"
  fi

  if [[ -z "${CLAUDE_TOTAL_TOKENS}" ]]; then
    if [[ "${CLAUDE_INPUT_TOKENS}" =~ ^[0-9]+$ ]]; then
      input_for_total="${CLAUDE_INPUT_TOKENS}"
      has_input_tokens=1
    fi
    if [[ "${CLAUDE_OUTPUT_TOKENS}" =~ ^[0-9]+$ ]]; then
      output_for_total="${CLAUDE_OUTPUT_TOKENS}"
      has_output_tokens=1
    fi
    if [[ "${CLAUDE_CACHE_WRITE_TOKENS}" =~ ^[0-9]+$ ]]; then
      cache_write_for_total="${CLAUDE_CACHE_WRITE_TOKENS}"
      has_cache_write_tokens=1
    fi
    if [[ "${CLAUDE_CACHE_READ_TOKENS}" =~ ^[0-9]+$ ]]; then
      cache_read_for_total="${CLAUDE_CACHE_READ_TOKENS}"
      has_cache_read_tokens=1
    fi

    if (( has_input_tokens == 1 || has_output_tokens == 1 || has_cache_write_tokens == 1 || has_cache_read_tokens == 1 )); then
      CLAUDE_TOTAL_TOKENS=$((input_for_total + output_for_total + cache_write_for_total + cache_read_for_total))
    fi
  fi
}

require_cmd "pnpm"
require_cmd "claude"

if ! [[ "${CLAUDE_TIMEOUT_SECONDS}" =~ ^[1-9][0-9]*$ ]]; then
  echo "CLAUDE_TIMEOUT_SECONDS must be a positive integer: ${CLAUDE_TIMEOUT_SECONDS}" >&2
  exit 1
fi

VERBOSE_OUTPUT=0
if is_verbose_output; then
  VERBOSE_OUTPUT=1
fi

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

if [[ -n "${TARGET_PATH}" ]]; then
  selected_dir="$(dirname "${PROMPT_FILES[0]}")"
  relative_selected_dir="${selected_dir#${REPO_ROOT}/}"
  echo "Target: ${relative_selected_dir}"
fi

echo
skills_add_output=""
if (( VERBOSE_OUTPUT == 1 )); then
  echo "Pulling latest skills"
  pnpm dlx skills add elevenlabs/skills --agent claude-code -y
  SKILLS_EXIT=$?
else
  printf "Updating skills... "
  skills_add_output="$(pnpm dlx skills add elevenlabs/skills --agent claude-code -y 2>&1)"
  SKILLS_EXIT=$?
  if [[ ${SKILLS_EXIT} -eq 0 ]]; then
    echo "done."
  else
    echo "failed."
  fi
fi
if [[ ${SKILLS_EXIT} -ne 0 ]]; then
  if (( VERBOSE_OUTPUT == 0 )) && [[ -n "${skills_add_output}" ]]; then
    printf "%s\n" "${skills_add_output}" >&2
  fi
  echo "Skills install failed." >&2
  exit "${SKILLS_EXIT}"
fi

FAILED_RUNS=0
GENERATED_RUNS=0
VERIFIED_RUNS=0
UPDATED_RUNS=0
TOTAL_PROMPTS=${#PROMPT_FILES[@]}
CURRENT_PROMPT=0
OVERALL_START_TIME="$(date +%s)"

echo
if (( VERBOSE_OUTPUT == 1 )); then
  echo "Running prompts with fresh Claude processes"
  echo "Claude timeout per prompt: ${CLAUDE_TIMEOUT_SECONDS}s"
  echo "Claude model: ${CLAUDE_MODEL}"
  echo "Output mode: verbose"
  echo "Examples: ${TOTAL_PROMPTS}"
else
  printf "  Model: %s | Timeout: %ss | Examples: %s\n" "${CLAUDE_MODEL}" "${CLAUDE_TIMEOUT_SECONDS}" "${TOTAL_PROMPTS}"
fi

for prompt_file in "${PROMPT_FILES[@]}"; do
  CURRENT_PROMPT=$((CURRENT_PROMPT + 1))
  project_dir="$(dirname "${prompt_file}")"
  relative_project_dir="${project_dir#${REPO_ROOT}/}"
  run_intent="generating"
  if [[ -d "${project_dir}/example" ]]; then
    run_intent="verifying"
  fi
  project_status_before=""
  project_status_after=""
  run_changed=0
  setup_output=""
  claude_raw_output=""

  if command -v git >/dev/null 2>&1; then
    project_status_before="$(git -C "${REPO_ROOT}" status --porcelain -- "${relative_project_dir}" 2>/dev/null || true)"
  fi

  echo
  if (( VERBOSE_OUTPUT == 1 )); then
    echo "[${CURRENT_PROMPT}/${TOTAL_PROMPTS}] Running: ${relative_project_dir}/PROMPT.md"
    if [[ "${run_intent}" == "generating" ]]; then
      echo "  Mode: generating (example/ missing)"
    else
      echo "  Mode: verifying (example/ already present)"
    fi
  else
    printf "[%s/%s] %s\n" "${CURRENT_PROMPT}" "${TOTAL_PROMPTS}" "${relative_project_dir}"
  fi

  # Run setup script if present, but skip if example/ already exists
  if [[ -f "${project_dir}/setup.sh" ]]; then
    if [[ -d "${project_dir}/example" ]]; then
      if (( VERBOSE_OUTPUT == 1 )); then
        echo "Skipping setup (example/ already exists): ${relative_project_dir}/setup.sh"
      fi
    else
      if (( VERBOSE_OUTPUT == 1 )); then
        echo "Running setup: ${relative_project_dir}/setup.sh"
      fi
      if (( VERBOSE_OUTPUT == 1 )); then
        bash "${project_dir}/setup.sh"
        SETUP_EXIT=$?
      else
        setup_output="$(bash "${project_dir}/setup.sh" 2>&1)"
        SETUP_EXIT=$?
      fi
      if [[ ${SETUP_EXIT} -ne 0 ]]; then
        FAILED_RUNS=$((FAILED_RUNS + 1))
        if (( VERBOSE_OUTPUT == 1 )); then
          echo "  ✗ Setup failed" >&2
        else
          echo "      ✗ Setup failed" >&2
          if [[ -n "${setup_output}" ]]; then
            printf "%s\n" "${setup_output}" >&2
          fi
        fi
        continue
      fi
    fi
  fi

  claude_started_at="$(date +%s)"
  claude_raw_output="$(
    (
      cd "${project_dir}" || exit 1
      prompt_text="$(cat "PROMPT.md")"

      # Prepend repo-specific context that keeps PROMPT.md portable
      preamble=""
      if [[ -d "example" ]]; then
        preamble+="IMPORTANT: Check the existing code in example/ first. Only make changes if the requirements below are not already met. If everything is already implemented correctly, confirm that no changes are needed."$'\n\n'
      fi
      if [[ -f "setup.sh" ]]; then
        setup_detail="Prerequisite: \`setup.sh\` has already been run. \`example/\` is ready with dependencies installed"
        if [[ -d "assets" ]]; then
          asset_list="$(ls -1 assets/ 2>/dev/null | paste -sd ', ' -)"
          if [[ -n "${asset_list}" ]]; then
            setup_detail+=" and sample assets (${asset_list})"
          fi
        fi
        preamble+="${setup_detail}."$'\n\n'
      fi
      preamble+="Implement in \`example/\` only."
      if [[ -f "${REPO_ROOT}/DESIGN.md" ]]; then
        preamble+=$'\n\n'"Read \`DESIGN.md\` at the repo root for styling rules. Preserve any existing template header and layout container."
      fi
      prompt_text="${preamble}"$'\n\n'"${prompt_text}"
      claude_cmd=(claude --dangerously-skip-permissions)
      if [[ -n "${CLAUDE_MODEL}" ]]; then
        claude_cmd+=(--model "${CLAUDE_MODEL}")
      fi
      claude_cmd+=(-p --output-format json "${prompt_text}")
      run_with_timeout \
        "${CLAUDE_TIMEOUT_SECONDS}" \
        "${claude_cmd[@]}"
    ) 2>&1
  )"
  RUN_EXIT=$?

  if command -v jq >/dev/null 2>&1 && jq -e '.result != null and .result != ""' >/dev/null 2>&1 <<< "${claude_raw_output}"; then
    if (( VERBOSE_OUTPUT == 1 )); then
      jq -r '.result' <<< "${claude_raw_output}"
    fi
  elif (( VERBOSE_OUTPUT == 1 )); then
    printf "%s\n" "${claude_raw_output}"
  fi

  claude_finished_at="$(date +%s)"
  claude_duration_seconds=$((claude_finished_at - claude_started_at))
  claude_duration_human="$(format_duration "${claude_duration_seconds}")"
  extract_claude_usage "${claude_raw_output}"
  token_display="$(format_token_display "${CLAUDE_TOTAL_TOKENS}")"

  if [[ ${RUN_EXIT} -ne 0 ]]; then
    FAILED_RUNS=$((FAILED_RUNS + 1))
    if (( VERBOSE_OUTPUT == 1 )); then
      echo "  ✗ Failed (${run_intent})" >&2
      if [[ -n "${CLAUDE_TOTAL_TOKENS}" ]]; then
        echo "    ${claude_duration_human}, ${CLAUDE_TOTAL_TOKENS} token(s)" >&2
      else
        echo "    ${claude_duration_human}, tokens unknown" >&2
      fi
    else
      echo "      ✗ Failed in ${claude_duration_human} (${token_display})" >&2
      if [[ -n "${claude_raw_output}" ]]; then
        echo "        Claude output:" >&2
        printf "%s\n" "${claude_raw_output}" >&2
      fi
    fi
  else
    if command -v git >/dev/null 2>&1; then
      project_status_after="$(git -C "${REPO_ROOT}" status --porcelain -- "${relative_project_dir}" 2>/dev/null || true)"
      if [[ "${project_status_before}" != "${project_status_after}" ]]; then
        run_changed=1
      fi
    fi

    if [[ "${run_intent}" == "generating" ]]; then
      GENERATED_RUNS=$((GENERATED_RUNS + 1))
      if (( VERBOSE_OUTPUT == 1 )); then
        if [[ -n "${CLAUDE_TOTAL_TOKENS}" ]]; then
          echo "  ✓ Generated (${claude_duration_human}, ${CLAUDE_TOTAL_TOKENS} tokens)"
        else
          echo "  ✓ Generated (${claude_duration_human}, tokens unknown)"
        fi
      else
        echo "      ✓ Generated in ${claude_duration_human} (${token_display})"
      fi
    elif (( run_changed == 0 )); then
      VERIFIED_RUNS=$((VERIFIED_RUNS + 1))
      if (( VERBOSE_OUTPUT == 1 )); then
        if [[ -n "${CLAUDE_TOTAL_TOKENS}" ]]; then
          echo "  ✓ Verified, no changes (${claude_duration_human}, ${CLAUDE_TOTAL_TOKENS} tokens)"
        else
          echo "  ✓ Verified, no changes (${claude_duration_human}, tokens unknown)"
        fi
      else
        echo "      ✓ Verified, no changes in ${claude_duration_human} (${token_display})"
      fi
    else
      UPDATED_RUNS=$((UPDATED_RUNS + 1))
      if (( VERBOSE_OUTPUT == 1 )); then
        if [[ -n "${CLAUDE_TOTAL_TOKENS}" ]]; then
          echo "  ~ Updated during verification (${claude_duration_human}, ${CLAUDE_TOTAL_TOKENS} tokens)"
        else
          echo "  ~ Updated during verification (${claude_duration_human}, tokens unknown)"
        fi
      else
        echo "      ~ Updated in ${claude_duration_human} (${token_display})"
      fi
    fi
  fi
done

OVERALL_END_TIME="$(date +%s)"
OVERALL_DURATION="$(format_duration $((OVERALL_END_TIME - OVERALL_START_TIME)))"

echo
echo "────────────────────────────────────────────────"
printf "  %s generated · %s verified · %s updated · %s failed\n" "${GENERATED_RUNS}" "${VERIFIED_RUNS}" "${UPDATED_RUNS}" "${FAILED_RUNS}"
printf "  Total time: %s\n" "${OVERALL_DURATION}"
echo "────────────────────────────────────────────────"
if [[ ${FAILED_RUNS} -ne 0 ]]; then
  echo "${FAILED_RUNS} prompt run(s) failed." >&2
  exit 1
fi
