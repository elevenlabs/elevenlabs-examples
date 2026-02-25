# Realtime Transcription — Next.js + ElevenLabs Scribe v2

Live microphone transcription using ElevenLabs Scribe v2 real-time API with a Next.js App Router frontend.

## Setup

1. Copy the environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and set `ELEVENLABS_API_KEY` to your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

2. Install dependencies:

```bash
pnpm install
```

## Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Start transcription** to begin.
