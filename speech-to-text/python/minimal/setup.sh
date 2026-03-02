#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Clean example/ but preserve .venv for speed
if [ -d example ]; then
  find example -mindepth 1 -maxdepth 1 ! -name .venv -exec rm -rf {} +
fi
mkdir -p example

# Copy template into example/
rsync -a \
  --exclude .venv \
  --exclude example \
  template/ example/

# Copy sample assets into example/
if [ -d "$DIR/assets" ]; then
  cp -a "$DIR/assets/." example/
fi

# Setup env
if [ -f "$DIR/.env" ]; then
  cp "$DIR/.env" example/.env
fi

# Install dependencies
cd example
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt
