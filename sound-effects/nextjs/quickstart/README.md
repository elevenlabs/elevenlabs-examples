# Sound Effects Playground (Next.js)

Enter a prompt, generate a sound effect with the ElevenLabs Sound Effects API, and play it back in the browser.

## Setup

1. Copy the environment file and add your API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and paste your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

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

- Enter the sound effect you want to generate.
- Click **Generate sound effect**.
- Wait for the request to finish, then play the generated audio in the built-in player.
