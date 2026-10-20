# OpenAI Realtime SDK with ElevenLabs (Next.js)

Hold a voice conversation with ElevenLabs Realtime using OpenAI's Realtime SDK (`@openai/agents-realtime`), pointed at the ElevenLabs OpenAI-compatible endpoint instead of `api.openai.com`. See the [OpenAI Realtime API compatibility guide](https://elevenlabs.io/docs/eleven-agents/guides/openai-realtime-compatibility).

## Setup

1. Copy the environment file and add your API key:

   ```bash
   cp .env.example .env.local
   ```

   Then set:
   - `ELEVENLABS_API_KEY`

2. Install dependencies:

   ```bash
   pnpm install
   ```

## Run

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Click **Start** and allow microphone access when prompted.
- Talk; the agent replies by voice and the transcript fills in as you go.
- Expand **Transport events** to see the raw OpenAI Realtime events exchanged with ElevenLabs.
- Click **Stop** to end the session.

## How it works

- `app/api/token/route.ts` mints a short-lived client secret with `client.conversationalAi.realtime.createClientSecret`, so `ELEVENLABS_API_KEY` never reaches the browser.
- The browser passes that secret to `RealtimeSession.connect()` and connects `OpenAIRealtimeWebSocket` to `wss://api.elevenlabs.io/v1/convai/realtime`.
- The SDK only wires audio automatically for WebRTC, so the page captures and plays PCM16 audio at 24kHz with [`wavtools`](https://www.npmjs.com/package/wavtools).
