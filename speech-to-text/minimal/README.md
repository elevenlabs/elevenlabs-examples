# ElevenLabs Speech-to-Text — Minimal Example

Transcribe audio to text using ElevenLabs Scribe v2.

## Setup

1. Copy the example env file and add your API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

2. Install dependencies:

   ```bash
   pnpm install
   ```

## Run

Transcribe the bundled quickstart sample:

```bash
pnpm run start
```

Transcribe a local file:

```bash
pnpm run start -- ./audio.mp3
```
