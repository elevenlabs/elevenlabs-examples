#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Clean example/ but preserve node_modules for speed
if [ -d example ]; then
  find example -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +
fi
mkdir -p example

# Copy template into example/
rsync -a \
  --exclude node_modules \
  --exclude pnpm-lock.yaml --exclude package-lock.json \
  --exclude example \
  template/ example/

# Setup env
if [ -f "$DIR/.env" ]; then
  cp "$DIR/.env" example/.env
fi

# Install dependencies
cd example
pnpm install --config.confirmModulesPurge=false
