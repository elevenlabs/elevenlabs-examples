Before writing any code, invoke the `/agents` skill to learn the correct ElevenLabs SDK patterns.

## `app/api/agent+api.ts`

Secure Expo Router API route that creates or loads a voice agent. Never expose `ELEVENLABS_API_KEY` to the client.

- `POST` creates a new voice agent with sensible defaults (name, system prompt, first message, TTS voice). Use the CLI `voice-only` template as reference for the agent shape.
- `GET` loads an existing agent by `agentId` query param.
- Configure as voice-first: real TTS voice and model, text-only disabled, widget text input disabled.
- For English agents (`language: "en"`), use `tts.modelId: "eleven_flash_v2"`. Do not use `eleven_flash_v2_5` for English-only agents, or agent creation may fail validation.
- Enable client events needed for transcript rendering and audio.
- Return `{ agentId, agentName }`.

## `app/api/conversation-token+api.ts`

Secure GET endpoint that returns a signed WebSocket URL for a given `agentId` using `getSignedUrl`.
Never expose `ELEVENLABS_API_KEY` to the client. Return `{ signedUrl }` as JSON.
Do NOT use `getWebrtcToken` — WebRTC does not work reliably in the Expo web runtime.

## `app/index.tsx`

Minimal Expo Router voice agent screen.

- Use `@elevenlabs/react` and the `useConversation` hook for the web experience.
- Show a `Create Agent` button and an editable agent-id input. Auto-populate on create; allow pasting a different id to load it instead.
- Start sessions with a signed URL from `/api/conversation-token` using `startSession({ signedUrl })`. Do NOT pass `connectionType: "webrtc"`. Request mic access before starting.
- Show a Start/Stop toggle, connection status, and running conversation transcript (append messages, don't replace).
- Handle errors gracefully and allow reconnect. Keep the UI simple and voice-first.
- Keep the verified path web-first: use relative fetch calls for Expo web, and render a brief native fallback note instead of attempting an unsupported in-app server flow.
