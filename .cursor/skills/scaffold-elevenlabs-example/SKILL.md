---
name: scaffold-elevenlabs-example
description: Scaffold prompt-driven examples in this repository using the existing example patterns and repo skills in `.agents/skills`. Use when adding a new example directory, creating matching `README.md`, `PROMPT.md`, and `setup.sh` files, or preparing a new example for `pnpm run generate`.
---

# Scaffold ElevenLabs Example

Use this skill when a user wants a new example scaffold in this repo.

## Defaults

- Ignore the deprecated root `examples/` folder.
- Put new examples under `<product>/<runtime>/<slug>`.
- The parent example directory owns authoring files; generated code lives in `example/`.

## Inputs to confirm

- destination path
- product and runtime
- whether the example needs bundled `assets/`
- whether the user wants scaffold only or scaffold plus a generated `example/`

Ask concise follow-ups only when these are missing.

## Workflow

1. Read [reference.md](reference.md).
2. Inspect available repo skills in `.agents/skills/` and choose the best fit for the requested example.
3. Prefer the helper scaffold:

```bash
python3 .cursor/skills/scaffold-elevenlabs-example/scripts/scaffold_example.py \
  --path text-to-speech/nextjs/my-example
```

Add `--with-assets` when the example should ship sample files, or `--reference <path>` to copy from a specific existing example.

4. Edit the scaffolded `README.md`, `PROMPT.md`, and `setup.sh` until they match the requested example.
5. Treat the helper output as a copy of the closest reference. Adapt all three files for the new example.
6. Keep `PROMPT.md` terse:

- first line invokes the most relevant repo skill found in `.agents/skills/`; for current examples this is often `/text-to-speech`, `/speech-to-text`, or `/agents`, but do not assume that list is exhaustive
- sections are file-by-file using `## \`path/to/file\``
- bullets call out concrete SDKs, env handling, models, voice IDs, UI states, and error handling
- do not restate repo preamble like `example/`-only rules or `DESIGN.md`; the generator adds that

7. Keep `setup.sh` aligned with current patterns:

- use `set -euo pipefail`
- derive `DIR` and `REPO_ROOT`
- clean `example/` but preserve cache dirs (`node_modules`, `.venv`, `.next`) when relevant
- seed from `templates/<runtime>/`
- copy `README.md` into `example/README.md`
- copy `assets/` and local `.env` only when present
- install dependencies at the end
- for `nextjs`, fetch latest ElevenLabs package versions at setup time and patch `package.json`

8. Keep `README.md` aligned with the closest current reference:

- always include a heading, one-sentence summary, `## Setup`, and `## Run`
- add `## Usage` for interactive examples such as Next.js and agents demos
- commands should work from inside `example/`

9. Recommended when shipping the example: add it to the root `README.md`.
10. Verify:

- `bash <path>/setup.sh`
- inspect the generated `example/`
- run `pnpm run generate <path>` only when the user wants full prompt validation or generated output

## Constraints

- Stay inside the current template matrix unless the user explicitly asks for a new base template.
- Reuse the closest existing example instead of inventing a new file format.
- Do not add application code directly under the parent example directory.
- Do not use the deprecated root `examples/` folder for new work.

## Output checklist

- [ ] new example directory exists at the requested path
- [ ] `README.md`, `PROMPT.md`, and `setup.sh` exist
- [ ] `setup.sh` uses the correct shared template
- [ ] `PROMPT.md` matches the terse style of the current examples
- [ ] the scaffold is ready for `pnpm run generate <path>`
