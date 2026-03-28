# Example Generator Reference

## Generator behavior

- `pnpm run generate` runs `scripts/generate-examples.sh`.
- The script finds every `PROMPT.md` outside ignored folders.
- If a target folder has `setup.sh` and no `example/`, it runs `setup.sh` first.
- The generator prepends repo context before sending the prompt:
  - check existing `example/` first
  - `setup.sh` already ran
  - implement in `example/` only
  - read root `DESIGN.md` for UI work
- The generator auto-loads repo SDK skills from `.agents/skills` when the prompt contains backticked skill names such as ``/text-to-speech``. Keep the backticks and leading slash.

## Available repo skills

Inspect `.agents/skills/*/SKILL.md` before finalizing the first line of `PROMPT.md`.

Current repo skills:

- `/agents`
- `/music`
- `/setup-api-key`
- `/sound-effects`
- `/speech-to-text`
- `/text-to-speech`

## Directory shape

```text
<product>/<runtime>/<slug>/
|-- README.md
|-- PROMPT.md
|-- setup.sh
|-- assets/          # optional
|-- .env             # optional, local only
`-- example/         # generated output
```

Ignore the deprecated root `examples/` folder for new work.

## Current example matrix

| Path | Shared template | Prompt sections | Setup extras |
| --- | --- | --- | --- |
| `text-to-speech/typescript/quickstart` | `templates/typescript` | `index.ts` | Copies `.env`, preserves `node_modules`, installs with `pnpm` |
| `text-to-speech/python/quickstart` | `templates/python` | `main.py` | Copies `.env`, preserves `.venv`, installs with `pip` |
| `speech-to-text/typescript/quickstart` | `templates/typescript` | `index.ts` | Optional `assets/`, copies `.env`, preserves `node_modules` |
| `speech-to-text/python/quickstart` | `templates/python` | `main.py` | Optional `assets/`, copies `.env`, preserves `.venv` |
| `speech-to-text/nextjs/realtime` | `templates/nextjs` | `app/api/scribe-token/route.ts`, `app/page.tsx` | Adds `@elevenlabs/react` and `@elevenlabs/elevenlabs-js`, copies `.env.local`, preserves `node_modules` and `.next` |
| `agents/nextjs/quickstart` | `templates/nextjs` | `app/api/agent/route.ts`, `app/api/conversation-token/route.ts`, `app/page.tsx` | Same Next.js setup pattern, removes `@elevenlabs/client` if present |
| `agents/nextjs/guardrails` | `templates/nextjs` | `app/api/agent/route.ts`, `app/api/conversation-token/route.ts`, `app/page.tsx` | Same as quickstart, but prompt targets guardrails and `onGuardrailTriggered` |

## Runtime setup rules

| Runtime | Seed template | Preserve on clean | Env copied into `example/` | Install step |
| --- | --- | --- | --- | --- |
| `typescript` | `templates/typescript/` | `node_modules` | `.env` | `pnpm install --config.confirmModulesPurge=false` |
| `python` | `templates/python/` | `.venv` | `.env` | create `.venv`, upgrade `pip`, `pip install -r requirements.txt` |
| `nextjs` | `templates/nextjs/` | `node_modules`, `.next` | `.env.local` | patch `package.json`, then `pnpm install --config.confirmModulesPurge=false` |

## Prompt rules

- Start with `Before writing any code, invoke the \`/skill-name\` skill...`.
- Choose that skill by checking `.agents/skills/` first; do not assume only `/text-to-speech`, `/speech-to-text`, and `/agents` exist.
- Use `## \`path/to/file\`` headings only for files inside `example/`.
- Keep prompts short and implementation-focused. Current prompts are direct checklists, not essays.
- Mention the concrete SDK client, env loading, output format, model ids, voice ids, API route security, and UI behavior when those details are known.
- Do not repeat repo-wide context that the generator already injects.

## README rules

- Always include a title, one-sentence summary, `## Setup`, and `## Run`.
- Add `## Usage` for interactive or multi-step examples such as Next.js and agents demos.
- Keep commands valid from inside `example/`.
- Use the closest current example as the formatting reference.

## Best reference by request

- Simple CLI text-to-speech script: start from `text-to-speech/typescript/quickstart` or `text-to-speech/python/quickstart`.
- CLI transcription or file-based Scribe example: start from the speech-to-text quickstarts.
- Realtime microphone UI: start from `speech-to-text/nextjs/realtime`.
- Voice agent creation and conversation UI: start from `agents/nextjs/quickstart`.
- For specialized agent behavior, start from `agents/nextjs/quickstart` and consult `agents/nextjs/guardrails` only as an existing reference, not as a scaffold mode.

## Scaffold helper

The helper script supports the current template matrix and seeds `README.md`, `PROMPT.md`, and `setup.sh` from the closest current pattern.

```bash
python3 .cursor/skills/scaffold-elevenlabs-example/scripts/scaffold_example.py \
  --path agents/nextjs/my-agent-demo \
  --title "My Agent Demo (Next.js)" \
  --summary "One-sentence summary."
```

Useful flags:

- `--with-assets` to add the asset copy step and create `assets/`
- `--force` to overwrite scaffold files in an existing directory

The helper intentionally emits a generic baseline scaffold. If the requested example needs specialized behavior, hand-edit the scaffold after creation instead of expecting a dedicated helper mode.

If the user asks for a product or runtime outside the current matrix, use the closest supported example as the reference and hand-edit the files instead of relying entirely on the helper.
