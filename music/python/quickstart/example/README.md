# ElevenLabs Music - Quickstart Python Example

Generate an MP3 music track from a text prompt using the ElevenLabs Python SDK.

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

The Music API is currently available to paid ElevenLabs users.

## Run

```bash
.venv/bin/python main.py "A chill lo-fi beat with jazzy piano chords"
```

The generated track is saved to `output.mp3`.
