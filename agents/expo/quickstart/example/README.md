# Real-Time Voice Agent (Expo)

Live voice conversations with the ElevenLabs Agents Platform in an Expo Router app with secure Expo API routes for web.

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
pnpm run web
```

Open the local Expo web URL shown in the terminal.

## Usage

- Enter an agent name and a system prompt, then click **Create agent**.
- The app creates the agent server-side and stores the returned agent id in the page.
- Click **Start** and allow microphone access when prompted.
- The app fetches a fresh conversation token for the created agent and starts a WebRTC session.
- Speak naturally and watch the live conversation state update as the agent listens and responds.
- The page shows whether the agent is currently speaking and renders the interaction as a running conversation.
- Click **Stop** to end the session.
- This quickstart is verified for Expo web. Native builds need a deployed Expo server origin before the in-app client can call the secure API routes.
