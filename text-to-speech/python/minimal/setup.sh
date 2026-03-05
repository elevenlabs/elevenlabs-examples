#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/../../.." && pwd)"
cd "$DIR"

# Clean example/ but preserve .venv for speed
if [ -d example ]; then
  find example -mindepth 1 -maxdepth 1 ! -name .venv -exec rm -rf {} +
fi
mkdir -p example

# Copy shared template into example/
rsync -a \
  --exclude .venv \
  --exclude example \
  "$REPO_ROOT/templates/python/" example/

# Copy project-specific README
cp README.md example/README.md

# Setup env
if [ -f "$DIR/.env" ]; then
  cp "$DIR/.env" example/.env
fi

# Install dependencies
cd example
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt
