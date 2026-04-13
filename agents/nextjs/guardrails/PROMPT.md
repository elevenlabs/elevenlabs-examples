Before writing any code, invoke the `/agents` skill to learn the correct ElevenLabs SDK patterns.

## 1. `package.json`

- Add `@elevenlabs/react` (with `onGuardrailTriggered` support) and `@elevenlabs/elevenlabs-js` dependencies.

## 2. `app/api/agent/route.ts`

Secure route that creates or loads a voice agent with guardrails. Never expose `ELEVENLABS_API_KEY` to the client.

- `POST` creates a new voice agent with sensible defaults (name, first message, TTS voice). Use the CLI `voice-only` template as reference for the agent shape.
- `GET` loads an existing agent by `agentId`.
- Use a banking assistant system prompt with a `# Guardrails` section containing behavioral rules.
- Enable guardrails: a custom guardrail (e.g., no investment recommendations) that terminates the conversation when triggered, plus prompt-injection protection.
- Configure as voice-first: real TTS voice and model, text-only disabled, widget text input disabled.
- For English agents (`language: "en"`), use `tts.modelId: "eleven_flash_v2"`. Do not use `eleven_flash_v2_5` for English-only agents, or agent creation may fail validation.
- Enable client events for transcript rendering, audio, and `guardrail_triggered`.
- Return `{ agentId, agentName }`.

## 3. `app/api/conversation-token/route.ts`

Secure GET endpoint that returns a fresh conversation token for a given `agentId`.
Never expose `ELEVENLABS_API_KEY` to the client.

## 4. `app/page.tsx`

Minimal Next.js voice guardrails demo page.

- Use `ConversationProvider` from `@elevenlabs/react`.
- Use the granular conversation hooks `useConversationControls`, `useConversationStatus`, and `useConversationMode`.
- Register `onGuardrailTriggered` on the provider.
- Show a `Create Agent` button and an editable agent-id input. Auto-populate on create; allow pasting a different id to load it instead.
- Start voice sessions with a fresh token from `/api/conversation-token`. Request mic access before starting.
- Rely on the SDK's connection-type inference when starting the session; do not hardcode `connectionType: "webrtc"` unless there is a specific reason.
- Show a Start/Stop toggle, connection status, and running conversation transcript (append messages, don't replace).
- Surface example prompts for testing the guardrail (e.g., asking about investments or Bitcoin).
- If the guardrail triggers, show a persistent status message and append a note to the transcript.
- Handle errors gracefully and allow reconnect. Keep the UI simple and voice-first.
