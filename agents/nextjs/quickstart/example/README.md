# Real-Time Voice Agent (Next.js)

Live voice conversations with the ElevenLabs Agents Platform using the [React Agents SDK](https://elevenlabs.io/docs/eleven-agents/libraries/react).

## Setup

1. Copy the environment file and add your credentials:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set:
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_AGENT_ID`

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
- The app fetches a fresh conversation token from the server and starts a WebRTC session with your ElevenLabs agent.
- Speak naturally and watch the live conversation state update as the agent listens and responds.
- The page shows whether the agent is currently speaking, plus the latest user and agent messages.
- Click **Stop** to end the session.
