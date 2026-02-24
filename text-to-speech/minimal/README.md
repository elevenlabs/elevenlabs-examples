# ElevenLabs Text-to-Speech — Minimal Example

Generate an MP3 file from text using the ElevenLabs JS SDK.

## Setup

1. Copy the environment file and add your API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and paste your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

2. Install dependencies:

   ```bash
   pnpm install
   ```

## Run

```bash
pnpm run start -- "Hello from ElevenLabs"
```

The generated audio is saved to `output.mp3`.
