# Real-Time Voice Agent (Next.js)

Live voice conversations with the ElevenLabs Agents Platform using the [React Agents SDK](https://elevenlabs.io/docs/eleven-agents/libraries/react).

## Setup

1. Copy the environment file and add your credentials:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set:
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

- Enter an agent name and a system prompt, then click **Create agent**.
- The app creates the agent server-side and stores the returned agent id in the page.
- Click **Start** and allow microphone access when prompted.
- The app fetches a fresh conversation token for the created agent and starts a WebRTC session.
- Speak naturally and watch the live conversation state update as the agent listens and responds.
- The page shows whether the agent is currently speaking and renders the interaction as a running conversation.
- Click **Stop** to end the session.
