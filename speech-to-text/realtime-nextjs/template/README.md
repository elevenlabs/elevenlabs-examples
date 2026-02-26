# Real-Time Microphone Transcription (Next.js)

Live speech-to-text transcription using ElevenLabs Scribe v2 real-time API with Voice Activity Detection (VAD).

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
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Click **Start** and allow microphone access when prompted.
- Speak naturally — live partial text appears in italic gray as you talk.
- After a pause, VAD commits the segment and it appears as regular text.
- Committed segments are shown in reverse chronological order (newest first).
- Click **Stop** to end the session.