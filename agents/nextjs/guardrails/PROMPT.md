Before writing any code, invoke the `/agents` skill to learn the correct ElevenLabs SDK patterns.

## 1. `package.json`

- Add the official ElevenLabs React SDK dependency needed to run browser conversations with the Agents Platform.
- Add the official ElevenLabs JavaScript SDK dependency needed to create agents and conversation tokens from Next.js API routes.

## 2. `app/api/agent/route.ts`

Secure route that creates or loads an agent.
Never expose `ELEVENLABS_API_KEY` to the client.

- Validate that `ELEVENLABS_API_KEY` exists and return a readable JSON error if missing.
- Support `GET` for loading an existing agent by `agentId`.
- For `GET`, return enough data for the app to confirm the agent exists and use it, at minimum the agent id.
- Support `POST` to create a new voice-enabled agent with sensible default values baked into the server route.
- Use the ElevenLabs CLI `voice-only` template as the mental reference for the server-side agent shape.
- Do not require the user to provide an agent name or system prompt in the UI.
- Configure the agent for spoken conversation with a reasonable `first_message`, language, and TTS voice.
- Put the system prompt in `conversationConfig.agent.prompt`, not in a separate top-level `prompt` field.
- Use a simple default name and a default system prompt suitable for a guardrails demo assistant.
- Include a `# Guardrails` section in the system prompt with concise high-priority behavioral rules.
- Create the agent with guardrails enabled so the demo shows both prompt hardening and platform guardrails.
- Add at least one custom guardrail that is easy to trigger in a demo with a spoken phrase.
- Make the custom guardrail terminate the conversation when it fires so the client can observe the guardrail-triggered event.
- Enable prompt-injection protection as part of the guardrails configuration.
- For an English voice agent, use a real voice TTS config with both `voiceId` and `modelId`.
- Prefer a regular voice-agent TTS model such as `eleven_turbo_v2` for this demo.
- Explicitly keep `conversation.textOnly = false`.
- Include the audio-related client events needed for a regular voice agent, such as `audio` and `interruption`.
- Enable the client events needed for transcript rendering so the React SDK `onMessage` callback receives user and agent messages.
- Explicitly enable the `guardrail_triggered` client event for agents created by this app.
- Be explicit and include the transcript-related client events needed by the app, including user transcript and agent response events.
- Set widget/platform settings so the created agent is clearly voice-first:
  - disable widget text input
  - disable text-only support in widget/platform settings
- Do not create an agent that presents itself as text-only or text-capable by default.
- Return a small JSON payload such as `{ agentId, agentName }`.
- Handle API failures with a readable JSON error.

## 3. `app/api/conversation-token/route.ts`

Secure GET endpoint that returns a fresh conversation token for a specified agent.
Never expose `ELEVENLABS_API_KEY` to the client.

- Validate that `ELEVENLABS_API_KEY` exists and return a readable JSON error if missing.
- Accept the target `agentId` in a simple explicit way and return a readable JSON error if it is missing.
- Use the ElevenLabs server SDK to create a conversation token for the agent.
- Return `{ token }` JSON.
- Handle API failures with a readable JSON error.

## 4. `app/page.tsx`

Minimal Next.js voice guardrails demo page.

- Use `@elevenlabs/react` and the `useConversation` hook.
- Do not show the agent name or system prompt in the UI.
- Render a `Create Agent` button that calls `/api/agent`.
- Render a text input next to that button for the agent id.
- After a new agent is created, automatically populate that agent-id input with the returned id.
- Keep the agent-id input editable so the user can paste a different existing agent id and use that one instead.
- When the user pastes or enters an agent id, load that agent from `/api/agent` so the app can confirm it exists and use it as the active agent.
- Handle lookup failures clearly if the pasted id is invalid or the agent cannot be loaded.
- Treat the agent-id input as the source of truth when starting conversations.
- Do not require `ELEVENLABS_AGENT_ID` in environment variables.
- Start sessions with WebRTC and fetch a fresh token from `/api/conversation-token` for the current agent id in that input before each start.
- Request microphone access right before starting the session.
- Prevent starting a conversation until the agent-id input has a non-empty value.
- Render a Start / Stop toggle and connection status.
- Show the interaction as a real conversation transcript instead of replacing the text each turn.
- Keep a running history of user and agent messages during the active session so it reads like chat.
- Use the React SDK callback shapes correctly:
  - `onMessage` from `useConversation` should be treated as high-level transcript messages from the React SDK, not as raw `IncomingSocketEvent` websocket payloads.
  - Read the sender from a `source` field such as `user` or `ai`, and read the text from the message payload.
  - Do not type or implement the main transcript logic as if `onMessage` were receiving low-level socket event unions from `@elevenlabs/client`.
- Use `onGuardrailTriggered` to show a clear in-app indication that a guardrail fired.
- Surface a visible trigger phrase somewhere near the controls so a user knows what to say to test the guardrail.
- Note in the UI that the trigger phrase is intended for agents created by this app.
- If the guardrail triggers, show a persistent status message even after the call ends.
- If useful, also append a short system-style line to the transcript when the guardrail is triggered.
- It is fine to style tentative agent text differently, but do not discard prior turns when a new message arrives.
- The transcript should work for agents created by this app. If a user pastes an older external agent id, validate that it exists, but note in code comments or logic that transcript and guardrail events still depend on that agent having the required client events enabled.
- Newly created agents from this app must behave like normal voice agents: they should speak out loud over WebRTC and should not advertise themselves as text-only.
- Keep the created agent available in page state so the user can create once and talk immediately, while still allowing the id field to be manually overridden.
- Handle connection and API errors gracefully and allow reconnect.
- Keep the UI simple and voice-first.
