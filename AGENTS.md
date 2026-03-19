## Cursor Cloud specific instructions

This is the ElevenLabs examples repository — a collection of prompt-driven quickstart examples for text-to-speech (TTS) and speech-to-text (STT) using the ElevenLabs API. See `README.md` for project overview and available examples.

### Required secret

- `ELEVENLABS_API_KEY` — needed to run any example. Each example's `.env.example` expects this variable.

### System dependency

- `python3.12-venv` must be installed (`sudo apt-get install -y python3.12-venv`) for Python examples to create virtual environments. The update script handles this.

### Running examples

Each example under `text-to-speech/` and `speech-to-text/` has an `example/` directory with its own `README.md` containing setup and run instructions. In short:

- **TypeScript examples**: `cd <example>/example && pnpm install && pnpm run start`
- **Python examples**: `cd <example>/example && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/python main.py`
- **Next.js example** (`speech-to-text/nextjs/realtime/example`): `pnpm install && pnpm run dev`

### Lint

- **Prettier** (root): `npx prettier --check "**/*.{ts,tsx,js,jsx,json,md,css}" --ignore-path .gitignore`
- **ESLint** (Next.js example): `cd speech-to-text/nextjs/realtime/example && npx eslint`

### Pre-commit

`pre-commit` is installed via pip and hooks are configured. Run `pre-commit install` after cloning if hooks are not already set up. You may need `export PATH="$HOME/.local/bin:$PATH"` and `git config --unset-all core.hooksPath` first.

### Gotchas

- The Next.js example warns about ignored build scripts for `msw`, `sharp`, and `unrs-resolver`. These can be approved by adding `pnpm.onlyBuiltDependencies` to the example's `package.json`, but the project works without them.
- The `scripts/generate-examples.sh` script requires the `cursor` CLI, which is not available in cloud agent environments. This script is for local development workflow only.
- The legacy `examples/` folder is deprecated per `README.md` and can be ignored for new work.
