# ElevenLabs Sound Effects - Quickstart Example

Generate a sound effect MP3 from a text prompt using the ElevenLabs JS SDK.

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
pnpm run start "Cinematic Braam, Horror"
```

The generated sound effect is saved to `output.mp3`.
