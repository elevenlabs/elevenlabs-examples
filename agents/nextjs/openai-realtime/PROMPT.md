Before writing any code, invoke the `/agents` skill to learn the correct ElevenLabs SDK patterns.

Build a voice demo that talks to ElevenLabs Realtime through OpenAI's Realtime SDK (`@openai/agents-realtime`), pointed at the ElevenLabs OpenAI-compatible endpoint instead of `api.openai.com`.

## 1. `package.json`

- Add `@elevenlabs/elevenlabs-js`, `@openai/agents-realtime`, and `wavtools` dependencies.

## 2. `lib/realtime-session.ts`

Shared constants used by both the server route and the browser.

- Export `REALTIME_URL` (`wss://api.elevenlabs.io/v1/convai/realtime`), `REALTIME_MODEL` (`eleven_realtime_v1_mini`), `REALTIME_VOICE` (`brian`), `AUDIO_SAMPLE_RATE` (`24000`), and short assistant instructions.
- Export a `sessionConfig` typed as `ElevenLabs.OpenAiSessionConfigInput`: `type: "realtime"`, the model and instructions, `outputModalities: ["audio"]`, `audio.input` with PCM format at 24kHz and `semantic_vad` turn detection, and `audio.output` with PCM format and the voice.
- Use the GA session shape (`outputModalities`, nested `audio.input`/`audio.output`). Do not use the deprecated top-level `modalities` or `voice` fields.

## 3. `app/api/token/route.ts`

Secure GET endpoint that mints a short-lived realtime client secret. Never expose `ELEVENLABS_API_KEY` to the client.

- Use `client.conversationalAi.realtime.createClientSecret({ session: sessionConfig, expiresAfter: { anchor: "created_at", seconds: 600 } })`.
- Return only `{ value }` to the browser.
- Return a JSON `{ error }` with a sensible status when the key is missing or the request fails.

## 4. `hooks/use-realtime-session.ts`

Client hook that owns the realtime session.

- Fetch `/api/token`, then create a `RealtimeAgent` and a `RealtimeSession` with an `OpenAIRealtimeWebSocket` transport using `REALTIME_URL`, the model, and the GA config (`outputModalities`, `audio.output.voice`). Connect with `session.connect({ apiKey: value })`.
- The SDK only wires audio for WebRTC. Capture and play PCM16 at 24kHz with `wavtools` (`WavRecorder`, `WavStreamPlayer`). Import `wavtools` dynamically inside `start` because it touches browser APIs at module load.
- Stream mic audio continuously with `session.sendAudio`; `wavtools` types `data.mono` as `Int16Array` but it is already an `ArrayBuffer` at runtime, so pass it through as-is.
- Play `audio` events via `add16BitPCM`, and interrupt playback on `audio_interrupted`.
- Track user speaking (`input_audio_buffer.speech_started/stopped`), agent speaking (`audio_start`/`audio_stopped`), response in flight (`response.created`/`response.done`), and the negotiated session (`session.created`/`session.updated`) from `transport_event`.
- Build the transcript from raw transport events: stream assistant text from `response.output_audio_transcript.delta`, take user text from `conversation.item.input_audio_transcription.completed`, finalize on `.done` or `response.done`, and order turns by `previous_item_id`.
- Keep a capped log of transport events, skipping the high-frequency audio and transcript deltas.
- Tear down recorder, player, and session on stop or error.

## 5. `app/page.tsx`

Minimal voice-first page.

- A Start/Stop toggle and connection status.
- While connected, show independent indicators for user speaking, agent speaking, and responding, plus the negotiated model, voice, and turn detection.
- A running transcript with a streaming caret for in-progress assistant turns and a "Transcribing…" placeholder for pending user turns.
- A collapsible list of recent transport events.
- Show errors inline and allow reconnecting.
