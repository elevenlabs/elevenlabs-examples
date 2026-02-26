Use the `speech-to-text` skill from the installed `elevenlabs/skills` package.

Workflow:
- Treat `template/` as read-only.
- Recreate `example/` from `template/` (replace if it exists), then implement the feature in `example/` only.

Implement:

1. `app/api/scribe-token/route.ts`
- Add a secure endpoint that returns a realtime Scribe token as `{ token }`.
- Return readable `500` JSON for configuration/runtime failures.

2. `app/page.tsx`
- Build realtime mic transcription UI:
  - Start/Stop button
  - connected/disconnected status badge
  - listening state and live partial transcript shown with `ShimmeringText`
  - committed transcripts (newest first)
- Prefer preloaded components from `example/components/ui`:
  - `LiveWaveform`
  - `ShimmeringText`
- Implement realtime transcription using ElevenLabs React SDK patterns from the `speech-to-text` skill.
- Start should begin live microphone transcription.
- Stop should end the session and clear partial transcript.
