# Text to Speech Playground (Next.js)

Generate speech from text in a Next.js app and play it back in the browser.

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

- Enter the text you want to turn into speech.
- Click **Generate speech**.
- Wait for the request to finish, then play or download the generated audio from the page.
