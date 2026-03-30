# Voice Changer (Next.js)

Record audio directly in the browser and change it to another voice using ElevenLabs Speech-to-Speech API.

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

- Click **Record** and allow microphone access when prompted.
- Speak into your microphone - a timer and pulsing indicator show the recording is active.
- Click **Stop** to end the recording and preview the original audio.
- The voice dropdown stays disabled until a recording is ready.
- Choose a target voice from the dropdown after recording.
- Click **Convert Voice** to transform the recording.
- After converting, pick a different voice and click **Convert Voice** again to create another version from the same recording.
- Play the converted result in the browser or download it.
- Click **Record Again** to start over.
