# Real-Time Microphone Transcription (Next.js)

Live speech-to-text transcription using ElevenLabs Scribe v2 real-time API with Voice Activity Detection (VAD).

## Features

- **Ultra-low latency**: ~150ms real-time transcription
- **Voice Activity Detection**: Automatic segmentation on natural pauses
- **Live waveform**: Visual audio feedback during recording
- **Partial transcripts**: See text as you speak
- **Committed history**: Final results saved and displayed
- **Secure tokens**: API key never exposed to client

## Setup

1. Copy the environment file and add your API key:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and paste your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

## Run

```bash
npm run dev
# or
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Click **Start** and allow microphone access when prompted.
- Speak naturally — live partial text appears as you talk.
- After a pause (1.5 seconds), VAD commits the segment to history.
- Committed segments are shown in reverse chronological order (newest first).
- Click **Stop** to end the session.
- Click **Clear History** to remove saved transcripts.

## Architecture

- **Frontend** (`app/page.tsx`): React component using `useScribe` hook from `@elevenlabs/react`
- **Token API** (`app/api/scribe-token/route.ts`): Generates secure single-use tokens
- **Waveform** (`components/ui/live-waveform.tsx`): Real-time audio visualization

## Customization

### VAD Settings
Adjust sensitivity in `app/page.tsx`:
```typescript
vadSilenceThresholdSecs: 1.5,  // Pause duration before commit
vadThreshold: 0.4,              // Sensitivity (0-1, lower = more sensitive)
```

### Microphone Settings
Configure audio processing:
```typescript
microphone: {
  echoCancellation: true,   // Remove echo
  noiseSuppression: true,   // Filter background noise
  autoGainControl: true,    // Normalize volume
}
```