<p align="center">
  <a href="https://elevenlabs.io">
    <h3 align="center">ElevenLabs Examples</h3>
  </a>
</p>

Prompt-driven ElevenLabs examples for text-to-speech and speech-to-text. Each project includes:

- `PROMPT.md` for agent-driven generation and updates
- `README.md` with manual setup and run steps

> The legacy `examples/` folder is being deprecated and can be ignored for new work.

## Current examples

- [Text-to-Speech Minimal](text-to-speech/minimal/README.md) - Generate an MP3 from text with the ElevenLabs JS SDK.
- [Speech-to-Text Minimal](speech-to-text/minimal/README.md) - Transcribe local audio files with Scribe v2.
- [Real-Time Speech-to-Text (Next.js)](speech-to-text/realtime-nextjs/README.md) - Live microphone transcription with VAD in a Next.js app.

## Generate examples from prompts

The general prompt-runner workflow is in `scripts/generate-examples.sh` and is exposed as:

```bash
pnpm run generate:examples
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
pnpm run generate:examples
```

Run only one example folder:

```bash
pnpm run generate:examples -- speech-to-text/realtime-nextjs
```

Run a specific prompt file directly:

```bash
pnpm run generate:examples -- text-to-speech/minimal/PROMPT.md
```

Optional timeout (seconds) per prompt run:

```bash
CLAUDE_TIMEOUT_SECONDS=1200 pnpm run generate:examples
```

Logs are written to `tmp/prompt-runs/<timestamp>/`.

## Try an example directly

Use the project README that matches what you want to test:

- Next.js real-time transcription: [speech-to-text/realtime-nextjs/README.md](speech-to-text/realtime-nextjs/README.md)
- Speech-to-text CLI minimal: [speech-to-text/minimal/README.md](speech-to-text/minimal/README.md)
- Text-to-speech CLI minimal: [text-to-speech/minimal/README.md](text-to-speech/minimal/README.md)

## Contributing

We welcome contributions from the community. Before you start:

1. Install the pre-commit hook:
   ```bash
   pip install pre-commit
   pre-commit install
   ```
2. Review [Contributing Guidelines](CONTRIBUTING.md).

## Learn more

- [ElevenLabs Developer Docs](https://elevenlabs.io/docs/api-reference/getting-started)
- [API Reference](https://api.elevenlabs.io/docs)
- [ElevenLabs app](https://elevenlabs.io/)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
