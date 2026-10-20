#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/../../.." && pwd)"
cd "$DIR"

# Clean example/ but preserve node_modules for speed
if [ -d example ]; then
  find example -mindepth 1 -maxdepth 1 ! -name node_modules ! -name .next -exec rm -rf {} +
fi
mkdir -p example

rsync -a \
  --exclude node_modules --exclude .next \
  --exclude pnpm-lock.yaml --exclude package-lock.json \
  --exclude example \
  "$REPO_ROOT/templates/nextjs/" example/

if [ -f README.md ]; then
  cp README.md example/README.md
fi

cd example
export ELEVENLABS_VER=$(npm view @elevenlabs/elevenlabs-js version)
export OPENAI_REALTIME_VER=$(npm view @openai/agents-realtime version)
export WAVTOOLS_VER=$(npm view wavtools version)
node -e "
  const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
  pkg.name = 'agents-openai-realtime-demo';
  pkg.dependencies['@elevenlabs/elevenlabs-js'] = '^' + process.env.ELEVENLABS_VER;
  pkg.dependencies['@openai/agents-realtime'] = '^' + process.env.OPENAI_REALTIME_VER;
  pkg.dependencies['wavtools'] = '^' + process.env.WAVTOOLS_VER;
  require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

mkdir -p app/api/token

if [ -f "$DIR/.env" ]; then
  cp "$DIR/.env" .env.local
fi

pnpm install --config.confirmModulesPurge=false
