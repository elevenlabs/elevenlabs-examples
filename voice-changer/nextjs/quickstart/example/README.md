# Voice Changer (Next.js)

Change the voice of any audio file using ElevenLabs Speech-to-Speech API.

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

- Select a target voice from the dropdown.
- Upload an audio file (MP3, WAV, M4A, WebM, or OGG).
- Click **Convert** to transform the voice.
- Play the result in the browser or download the converted file.
