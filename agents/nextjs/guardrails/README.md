# Voice Agent Guardrails Demo (Next.js)

Live voice conversations with the ElevenLabs Agents Platform, configured to demonstrate custom guardrails and the `guardrail_triggered` client event.

## Setup

1. Add your API key to `.env`:

   ```bash
   cp .env .env.local
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

- Click **Create agent** to create a voice-first demo agent with guardrails enabled.
- The page shows a demo trigger phrase for agents created by this app.
- Click **Start** and allow microphone access when prompted.
- Say the trigger phrase and the agent should hit its custom guardrail, end the session, and show a visible guardrail-triggered notice.
- You can also paste an existing agent id, but the trigger phrase and guardrail indicator are only guaranteed for agents created by this demo.
