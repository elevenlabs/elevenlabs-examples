![ElevenLabs Examples Header](./examples-header.png)

Prompt-driven ElevenLabs examples for text-to-speech and speech-to-text. Each project includes:

- `PROMPT.md` — instructions for agent-driven generation
- `setup.sh` — scaffolds the `example/` directory from a shared template
- `example/` — the generated, runnable example with its own `README.md`

Shared base templates live in `templates/` (Next.js, Python, TypeScript). UI styling rules are in `DESIGN.md`.

> The legacy `examples/` folder is being deprecated and can be ignored for new work.


## Current examples

- [Text-to-Speech Quickstart (TypeScript)](text-to-speech/typescript/quickstart/example/README.md) — Generate an MP3 from text with the ElevenLabs JS SDK.
- [Text-to-Speech Quickstart (Python)](text-to-speech/python/quickstart/example/README.md) — Generate an MP3 from text with the ElevenLabs Python SDK.
- [Speech-to-Text Quickstart (TypeScript)](speech-to-text/typescript/quickstart/example/README.md) — Transcribe local audio files with Scribe v2.
- [Speech-to-Text Quickstart (Python)](speech-to-text/python/quickstart/example/README.md) — Transcribe local audio files with Scribe v2.
- [Real-Time Speech-to-Text (Next.js)](speech-to-text/nextjs/realtime/example/README.md) — Live microphone transcription with VAD in a Next.js app.

## Generate examples from prompts

The general prompt-runner workflow is in `scripts/generate-examples.sh` and is exposed as:

```bash
pnpm run generate
```

### Prerequisites

- `pnpm`
- `claude` CLI

Install root dependencies first:

```bash
pnpm install
```

### Usage

Run all example prompts:

```bash
pnpm run generate
```

Run only one example:

```bash
pnpm run generate speech-to-text/nextjs/realtime
```

Optional flags:

```bash
pnpm run generate -t 1200                     # timeout per prompt in seconds (default: 600)
pnpm run generate -m opus                     # model selection (default: sonnet)
pnpm run generate -v                          # verbose output
pnpm run generate -m opus -t 1200 -v          # combine flags
```

## Try an example directly

Each example has an `example/` folder with a README containing setup and run instructions. See the links in [Current examples](#current-examples) above.

## Contributing

We welcome contributions from the community. Install the pre-commit hook before submitting:

```bash
pip install pre-commit
pre-commit install
```

## Learn more

- [ElevenLabs Developer Docs](https://elevenlabs.io/docs/api-reference/getting-started)
- [API Reference](https://api.elevenlabs.io/docs)
- [ElevenLabs app](https://elevenlabs.io/)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
