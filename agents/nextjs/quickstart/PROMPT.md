Before writing any code, invoke the `/agents` skill to learn the correct ElevenLabs SDK patterns.

## 1. `package.json`

- Add `@elevenlabs/react` and `elevenlabs` SDK dependencies.

## 2. `app/api/agent/route.ts`

Secure route that creates or loads a voice agent. Never expose `ELEVENLABS_API_KEY` to the client.

- `POST` creates a new voice agent with sensible defaults (name, system prompt, first message, TTS voice). Use the CLI `voice-only` template as reference for the agent shape.
- `GET` loads an existing agent by `agentId`.
- Configure as voice-first: real TTS voice and model, text-only disabled, widget text input disabled.
- For English agents (`language: "en"`), use `tts.modelId: "eleven_flash_v2"`. Do not use `eleven_flash_v2_5` for English-only agents, or agent creation may fail validation.
- Enable client events needed for transcript rendering and audio.
- Return `{ agentId, agentName }`.

## 3. `app/api/conversation-token/route.ts`

Secure GET endpoint that returns a fresh conversation token for a given `agentId`.
Never expose `ELEVENLABS_API_KEY` to the client.

## 4. `app/page.tsx`

Minimal Next.js voice agent page.

- Use `@elevenlabs/react` and the `useConversation` hook.
- Show a `Create Agent` button and an editable agent-id input. Auto-populate on create; allow pasting a different id to load it instead.
- Start WebRTC sessions with a fresh token from `/api/conversation-token`. Request mic access before starting.
- Show a Start/Stop toggle, connection status, and running conversation transcript (append messages, don't replace).
- Handle errors gracefully and allow reconnect. Keep the UI simple and voice-first.
