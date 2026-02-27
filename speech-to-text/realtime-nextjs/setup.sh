#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Clean example/ but preserve node_modules for speed
if [ -d example ]; then
  find example -mindepth 1 -maxdepth 1 ! -name node_modules ! -name .next -exec rm -rf {} +
fi
mkdir -p example

# Copy template structure (skip node_modules, .next, lock files, empty example/ dir)
rsync -a \
  --exclude node_modules --exclude .next \
  --exclude pnpm-lock.yaml --exclude package-lock.json \
  --exclude example \
  template/ example/

# Add ElevenLabs dependencies
cd example
node -e "
  const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
  pkg.name = 'realtime-transcription';
  pkg.dependencies['@elevenlabs/react'] = '^0.14.1';
  pkg.dependencies['@elevenlabs/elevenlabs-js'] = '^2.36.0';
  require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Create API route directory
mkdir -p app/api/scribe-token

# Setup env
if [ -f "$DIR/.env" ]; then
  cp "$DIR/.env" .env.local
fi

# Install dependencies
pnpm install --config.confirmModulesPurge=false
