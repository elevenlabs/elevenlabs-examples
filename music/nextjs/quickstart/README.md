# ElevenLabs Music Playground (Next.js)

Enter a prompt, generate a music track with the ElevenLabs Music API, and play it back in the browser.

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

The Music API is currently available to paid ElevenLabs users.

## Run

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Enter the kind of music track you want to generate.
- Click **Generate music**.
- Wait for the request to finish, then play or download the generated track from the page.
