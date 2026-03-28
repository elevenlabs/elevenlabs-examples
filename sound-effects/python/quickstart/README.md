# ElevenLabs Sound Effects - Quickstart Python Example

Generate a sound effect MP3 from a text prompt using the ElevenLabs Python SDK.

## Setup

1. Copy the environment file and add your API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and paste your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

2. Create a virtual environment and install dependencies:

   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```

## Run

```bash
.venv/bin/python main.py "Cinematic Braam, Horror"
```

The generated sound effect is saved to `output.mp3`.
