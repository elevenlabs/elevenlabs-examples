# Real-Time Microphone Transcription (Next.js)

Live speech-to-text transcription using ElevenLabs Scribe v2 real-time API with Voice Activity Detection (VAD).

## Features

- **Real-time transcription**: Live partial transcripts update as you speak
- **VAD auto-commit**: Automatically commits segments when silence is detected
- **Live waveform visualization**: Visual feedback while recording
- **Persistent history**: Transcription history persists during your session
- **Error recovery**: Handles connection drops gracefully with user-friendly messages

## Setup

1. Ensure you have your ElevenLabs API key in `.env`:

   ```bash
   ELEVENLABS_API_KEY=your_api_key_here
   ```

   Get your API key from [ElevenLabs Dashboard](https://elevenlabs.io/app/settings/api-keys).

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

1. **Start Recording**: Click the "Start Recording" button and allow microphone access when prompted
2. **Live Transcription**:
   - Blue "partial" text appears as you speak (live feedback)
   - After a pause, VAD automatically commits the segment
   - Committed text appears in the history section below
3. **View History**: All committed transcripts are shown newest-first
4. **Stop Recording**: Click "Stop Recording" to end the session (history is preserved)

## Implementation Details

- **Token Security**: API key never exposed to client; single-use tokens generated server-side
- **WebSocket Handling**: Graceful handling of connection drops with friendly error messages
- **State Management**: Clear separation between partial (ephemeral) and committed (persistent) transcripts
- **Audio Processing**: Microphone input with echo cancellation, noise suppression, and auto gain control

## API Endpoint

`/api/scribe-token` - Generates single-use tokens for client-side streaming (tokens expire after 15 minutes)