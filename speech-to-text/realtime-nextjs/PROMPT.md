Use the `speech-to-text` skill from the installed `elevenlabs/skills` package.

Workflow:
- Treat `template/` as read-only.
- Recreate `example/` from `template/` (replace if it exists), then implement the feature in `example/` only.

Goal:
- One-shot, working ElevenLabs realtime transcription demo with correct realtime state behavior.

Implement:

1. `app/api/scribe-token/route.ts`
- Add a secure endpoint that returns a realtime Scribe token as `{ token }`.
- Use ElevenLabs single-use token creation for realtime scribe.
- Return readable `500` JSON for configuration/runtime failures.
- Never expose `ELEVENLABS_API_KEY` to the client.

2. `app/page.tsx`
- Build realtime mic transcription UI:
  - Start/Stop button
  - connected/disconnected status badge (show connecting state when applicable)
  - listening state
  - live waveform visualization while listening
  - live partial transcript
  - committed transcripts (newest first)
  - visible error state (human-readable)
- UI guidance:
  - prefer preloaded `LiveWaveform` from `example/components/ui` when available
  - decorative animation and polish are allowed
  - avoid adding custom UI components for this task unless strictly required
  - prioritize correctness/reliability of transcription state over styling
- Implement realtime transcription using ElevenLabs React SDK patterns from the `speech-to-text` skill and the client-side streaming guide.
- Use model `scribe_v2_realtime`.
- Use VAD commit strategy for microphone transcription.
  - If the React SDK exposes VAD/commit strategy config, set it explicitly.
  - If microphone mode is VAD by default, keep that default and do not implement manual commit for mic mode.
- Start behavior:
  - Fetch a fresh token from `/api/scribe-token` each time Start is pressed (single-use tokens are short-lived).
  - Connect microphone with reasonable defaults (`echoCancellation`, `noiseSuppression`, `autoGainControl`).
- Realtime state contract (must be correct):
  - Partial transcript state is updated from partial events and treated as ephemeral.
  - Committed transcript state is updated only from committed events and treated as source of truth.
  - Clear partial transcript on commit and on stop/disconnect.
  - Keep committed history across stop/start in the same page session.
  - Prevent empty committed entries.
- Stop behavior:
  - Disconnect cleanly.
  - Reset transient state (listening/connecting/partial/error), but keep committed history.
- Connection reliability:
  - Handle SDK websocket close/error events gracefully and avoid uncaught promise rejections.
  - If websocket closes with code `1006`, show a friendly error message (e.g. "Connection dropped. Please try again.").
  - Reset transient state on disconnect, keep committed history, and allow reconnect via Start with a fresh token.
  - Do not leave UI stuck in connecting/connected state after disconnect.

Completion State: 
Go through the README file and make sure everything works.

