Before writing any code, invoke the `/speech-to-text` skill to learn the correct ElevenLabs SDK patterns.

## 1. `app/api/scribe-token/route.ts`

Secure GET endpoint that returns a single-use realtime Scribe token.
Never expose `ELEVENLABS_API_KEY` to the client.

## 2. `app/page.tsx`

Realtime microphone transcription page.

- Use the ElevenLabs React SDK's realtime scribe hook with VAD commit strategy.
- Fetch a fresh token from the API route on each start (tokens are single-use).
- Show a Start/Stop toggle, connection status, live waveform (use `LiveWaveform` from `components/ui`), partial transcript, and committed transcript history (newest first).
- Keep committed history across stop/start; clear transient state on disconnect.
- Handle connection errors gracefully and allow reconnect.
