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
- Click **Start** and allow microphone access when prompted.
- This demo models a banking-style policy: the agent should not recommend investments.
- Ask normal investment-advice questions such as "What should I invest ten thousand dollars in?" or "Should I buy Bitcoin or index funds right now?"
- If the agent crosses the line into investment recommendations, the custom guardrail should block the response before delivery, end the session, and show a visible guardrail-triggered notice.
- You can also paste an existing agent id, but the guardrail indicator is only guaranteed when that agent has the required client events enabled.
