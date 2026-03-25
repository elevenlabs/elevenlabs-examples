Before writing any code, invoke the `/agents` skill to learn the correct ElevenLabs SDK patterns.

## 1. `package.json`

- Add the official ElevenLabs React SDK dependency needed to run browser conversations with the Agents Platform.
- Add the official ElevenLabs JavaScript SDK dependency needed to create conversation tokens or signed URLs from Next.js API routes.

## 2. `app/api/conversation-token/route.ts`

Secure GET endpoint that returns a fresh conversation token for the configured agent.
Never expose `ELEVENLABS_API_KEY` to the client.

- Validate that `ELEVENLABS_API_KEY` exists and return a readable JSON error if missing.
- Read the target agent id from environment, for example `ELEVENLABS_AGENT_ID`, and return a readable JSON error if it is missing.
- Use the ElevenLabs server SDK to create a conversation token for the agent.
- Return `{ token }` JSON.
- Handle API failures with a readable JSON error.

## 3. `app/page.tsx`

Minimal Next.js voice agent page.

- Use `@elevenlabs/react` and the `useConversation` hook.
- Start sessions with WebRTC and fetch a fresh token from `/api/conversation-token` before each start.
- Request microphone access right before starting the session.
- Render a Start / Stop toggle, connection status, and whether the agent is currently speaking.
- Show the interaction as a real conversation transcript instead of replacing the text each turn.
- Keep a running history of user and agent messages during the active session so it reads like chat.
- It is fine to style tentative or partial text differently, but do not discard prior turns when a new message arrives.
- Handle connection and API errors gracefully and allow reconnect.
- Keep the UI simple and voice-first.
- Do not use the embed widget for this example.
