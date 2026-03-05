#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/../../.." && pwd)"
cd "$DIR"

# Clean example/ but preserve node_modules for speed
if [ -d example ]; then
  find example -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +
fi
mkdir -p example

# Copy shared template into example/
rsync -a \
  --exclude node_modules \
  --exclude pnpm-lock.yaml --exclude package-lock.json \
  --exclude example \
  "$REPO_ROOT/templates/typescript/" example/

# Copy project-specific README
cp README.md example/README.md

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
pnpm install --config.confirmModulesPurge=false
