# ElevenLabs Music — Quickstart Example

Generate an MP3 track from a text prompt using the ElevenLabs JS SDK.

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

The Music API is currently available to paid ElevenLabs users.

## Run

```bash
pnpm run start "A chill lo-fi beat with jazzy piano chords"
```

The generated track is saved to `output.mp3`.
